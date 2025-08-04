import crypto from 'crypto';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { NextRequest } from 'next/server';

import { ForgotPasswordRequestBody } from '@/shared/types/api/auth';
import connectToDatabase from '@lib/mongooseConect';
import getForgotPasswordTemplate from '@lib/resetPasswordEmail';
import sendEmail from '@lib/sendEmail';
import User from '@models/user';
import { createResponse } from '@utils/api/createResponse';
import { isString } from '@utils/guards/isString';
import { sanitizeInputBackEnd } from '@utils/sanitize/sanitizeInputBackEnd';
import { validateEmail } from '@utils/validation/';

export async function POST(req: NextRequest) {
	try {
		dayjs.extend(utc);

		await connectToDatabase();

		let rawBody: unknown;

		// Parse JSON body and fail early if malformed
		try {
			rawBody = await req.json();
		} catch {
			return createResponse({ success: false, error: 'Invalid JSON payload' }, 400);
		}

		// Assert rawBody shape as ForgotPasswordRequestBody
		const body = rawBody as ForgotPasswordRequestBody;

		// Validate that the properties are strings
		if (!isString(body.email)) {
			return createResponse({ success: false, error: 'Invalid request body' }, 400);
		}

		// Sanitize input
		const email = sanitizeInputBackEnd(body.email);

		if (!email) {
			return createResponse({ success: false, error: 'Missing required fields' }, 400);
		}

		const emailValidation = validateEmail(email);

		// If validation fails, return early
		if (!emailValidation.isValid) {
			return createResponse(
				{
					success: false,
					error: 'Validation failed',
					details: {
						email: emailValidation.error,
					},
				},
				400
			);
		}

		// search for user by the sanitized email
		const user = await User.findOne({ email: email });

		if (!user) {
			return createResponse(
				{
					success: false,
					error: 'If the email exists, we sent a reset link.',
				},
				200
			);
		}

		// Generate the Token to be send and stored
		const token = crypto.randomBytes(32).toString('hex');
		const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

		// Store on user database
		user.resetPasswordToken = hashedToken;
		user.resetPasswordExpires = dayjs().add(15, 'minute').utc().toDate(); // 15 minutes from now
		await user.save();

		// Send email here
		const domainURL = req.nextUrl.origin;
		const username = user.username;
		const html = getForgotPasswordTemplate(`${domainURL}/reset-password?token=${token}`, username);

		await sendEmail({
			to: email,
			subject: 'Reset Your Password',
			html,
		});

		return createResponse(
			{
				success: true,
				message: 'If the email exists, we sent a reset link.',
			},
			200
		);
	} catch (error) {
		console.error('Signup error:', error);
		return createResponse({ success: false, error: 'Internal Server Error' }, 500);
	}
}

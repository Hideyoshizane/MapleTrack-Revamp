import crypto from 'crypto';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { NextRequest } from 'next/server';

import connectToDatabase from '@lib/mongooseConect';
import getForgotPasswordTemplate from '@/lib/template/resetPasswordEmailTemplate';
import sendEmail from '@lib/sendEmail';
import User from '@models/user';
import { forgotPasswordRequestSchema } from '@schemas/authSchemas';
import { ApiResponse } from '@/shared/types/api';
import { createResponse } from '@utils/api/createResponse';
import { sanitizeInputBackEnd } from '@utils/sanitize/sanitizeInputBackEnd';
import { validateEmail } from '@utils/validation/';

export async function POST(req: NextRequest) {
	try {
		dayjs.extend(utc);

		await connectToDatabase();

		// Parse JSON safely
		let rawBody: unknown;
		try {
			rawBody = await req.json();
		} catch {
			return createResponse<ApiResponse>({ success: false, error: 'Invalid JSON payload' }, 400);
		}

		// Validate request body with zod
		const parseResult = forgotPasswordRequestSchema.safeParse(rawBody);
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, error: 'Invalid request body' }, 400);
		}

		// Sanitize input
		const email = sanitizeInputBackEnd(parseResult.data.email);
		if (!email) {
			return createResponse<ApiResponse>({ success: false, error: 'Missing required fields' }, 400);
		}

		// If validation fails, return early
		const emailValidation = validateEmail(email);
		if (!emailValidation.isValid) {
			return createResponse<ApiResponse>(
				{
					success: false,
					error: 'Validation failed',
					details: { email: emailValidation.error },
				},
				400
			);
		}

		// search for user by the sanitized email
		const user = await User.findOne({ email: email });
		if (!user) {
			return createResponse<ApiResponse>(
				{
					success: true,
					message: 'If the email exists, we sent a reset link.',
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

		return createResponse<ApiResponse>(
			{
				success: true,
				message: 'If the email exists, we sent a reset link.',
			},
			200
		);
	} catch (error) {
		console.error('Signup error:', error);
		return createResponse<ApiResponse>({ success: false, error: 'Internal Server Error' }, 500);
	}
}

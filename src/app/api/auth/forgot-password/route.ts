import crypto from 'crypto';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import User from '@features/user/userModel';
import connectToDatabase from '@lib/mongooseConect';
import { sendEmail } from '@lib/sendEmail';
import getForgotPasswordTemplate from '@lib/template/resetPasswordEmailTemplate';
import { forgotPasswordRequestSchema } from '@schemas/authSchemas';
import { createResponse } from '@utils/createResponse';
import { sanitizeInputBackEnd } from '@utils/sanitizeInputBackEnd';
import { validateEmail } from '@utils/validators';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		dayjs.extend(utc);

		await connectToDatabase();

		// Validate request body with zod
		const parseResult = forgotPasswordRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		// Sanitize input
		const email = sanitizeInputBackEnd(parseResult.data.email);
		if (!email) {
			return createResponse<ApiResponse>({ success: false, message: 'Missing required fields' }, 400);
		}

		// If validation fails, return early
		const emailValidation = validateEmail(email);
		if (!emailValidation.isValid) {
			const message = [emailValidation.error].filter(Boolean).join('\n');
			createResponse<ApiResponse>({ success: false, message: message }, 400);
		}

		// search for user by the sanitized email
		const user = await User.findOne({ email: email });
		if (!user) {
			return createResponse<ApiResponse>({ success: true, message: 'If the email exists, we sent a reset link.' }, 200);
		}

		// Generate the Token to be send and stored
		const token = crypto.randomBytes(32).toString('hex');

		// Store on user database
		user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
		user.resetPasswordExpires = dayjs().add(15, 'minute').utc().toDate(); // 15 minutes from now
		await user.save();

		// Send email here
		const domainURL = process.env.NEXT_PUBLIC_BASE_URL;
		if (!domainURL) throw new Error('NEXT_PUBLIC_BASE_URL is not defined');

		const html = getForgotPasswordTemplate(`${domainURL}/reset-password?token=${token}`, user.username);
		await sendEmail({ to: email, subject: 'Reset Your Password', html });

		return createResponse<ApiResponse>({ success: true, message: 'If the email exists, we sent a reset link.' }, 200);
	} catch (error) {
		console.error('Signup error:', error);
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

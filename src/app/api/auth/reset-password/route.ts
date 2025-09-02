import crypto from 'crypto';

import bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { NextRequest } from 'next/server';

import connectToDatabase from '@lib/mongooseConect';
import User from '@models/user';
import { resetPasswordRequestSchema } from '@schemas/authSchemas';
import { ApiResponse } from '@sharedTypes/api/api';
import { createResponse } from '@utils/api/createResponse';
import { sanitizeInputBackEnd } from '@utils/sanitize/sanitizeInputBackEnd';
import { validatePassword } from '@utils/validation/';

dayjs.extend(utc);

export async function POST(req: NextRequest) {
	try {
		await connectToDatabase();

		// Parse JSON safely
		let rawBody: unknown;
		try {
			rawBody = await req.json();
		} catch {
			return createResponse<ApiResponse>({ success: false, error: 'Invalid JSON payload' }, 400);
		}

		// Validate request body with Zod
		const parseResult = resetPasswordRequestSchema.safeParse(rawBody);
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, error: 'Invalid request body' }, 400);
		}

		const { token: rawToken, password: rawPassword } = parseResult.data;

		// Sanitize input
		const sanitizedToken = sanitizeInputBackEnd(rawToken);
		const sanitizedPassword = sanitizeInputBackEnd(rawPassword);
		if (!sanitizedToken || !sanitizedPassword) {
			return createResponse<ApiResponse>({ success: false, error: 'Missing required fields' }, 400);
		}

		// Validate sanitized inputs
		const passwordValidation = validatePassword(sanitizedPassword);
		if (!passwordValidation.isValid) {
			return createResponse<ApiResponse>(
				{ success: false, error: 'Validation failed', details: { password: passwordValidation.error } },
				400
			);
		}

		// Hash the token to compare against the hashed one stored in the DB
		const token = crypto.createHash('sha256').update(sanitizedToken).digest('hex');

		// Find user with matching reset token
		const user = await User.findOne({ resetPasswordToken: token });
		if (!user || !user.resetPasswordExpires || dayjs.utc(user.resetPasswordExpires).isBefore(dayjs.utc())) {
			return createResponse<ApiResponse>({ success: false, error: 'Invalid or expired token' }, 404);
		}

		// Compare new password with current one
		const isSamePassword = await bcrypt.compare(sanitizedPassword, user.password);
		if (isSamePassword) {
			return createResponse<ApiResponse>(
				{ success: false, error: 'New password must be different from the current password' },
				400
			);
		}

		// Generate the Token to be send and stored
		const hashedPassword = await bcrypt.hash(sanitizedPassword, 10);

		// Update user password and remove reset token
		user.password = hashedPassword;
		user.set('resetPasswordToken', undefined);
		user.set('resetPasswordExpires', undefined);
		await user.save();

		return createResponse<ApiResponse>({ success: true, message: 'Password reset successfully.' }, 200);
	} catch (error) {
		console.error('Signup error:', error);
		return createResponse<ApiResponse>({ success: false, error: 'Internal Server Error' }, 500);
	}
}

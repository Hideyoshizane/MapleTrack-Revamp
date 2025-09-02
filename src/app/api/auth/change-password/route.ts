import bcrypt from 'bcrypt';
import { NextRequest } from 'next/server';

import connectToDatabase from '@lib/mongooseConect';
import User from '@models/user';
import { changePasswordRequestSchema } from '@schemas/authSchemas';
import { ApiResponse } from '@sharedTypes/api/api';
import { createResponse } from '@utils/api/createResponse';
import { sanitizeInputBackEnd } from '@utils/sanitize/sanitizeInputBackEnd';
import { validatePassword } from '@utils/validation/';

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

		// Validate request body using Zod
		const parseResult = changePasswordRequestSchema.safeParse(rawBody);
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, error: 'Invalid request body' }, 400);
		}

		const {
			username: rawUsername,
			currentPassword: rawCurrentPassword,
			newPassword: rawNewPassword,
		} = parseResult.data;

		// Sanitize input
		const username = sanitizeInputBackEnd(rawUsername);
		const currentPassword = sanitizeInputBackEnd(rawCurrentPassword);
		const newPassword = sanitizeInputBackEnd(rawNewPassword);
		if (!username || !currentPassword || !newPassword) {
			return createResponse<ApiResponse>({ success: false, error: 'Missing required fields' }, 400);
		}

		// Validate sanitized inputs
		const passwordValidation = validatePassword(newPassword);
		// If any validation fails, return early
		if (!passwordValidation.isValid) {
			return createResponse<ApiResponse>(
				{
					success: false,
					error: 'Validation failed',
					details: { password: passwordValidation.error },
				},
				400
			);
		}

		// Find user by username
		const user = await User.findOne({ username });
		if (!user) {
			return createResponse<ApiResponse>({ success: false, error: 'Invalid username' }, 404);
		}

		// Verify current password
		const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
		if (!isCurrentPasswordCorrect) {
			return createResponse<ApiResponse>({ success: false, error: 'Current password is incorrect' }, 401);
		}

		// Ensure new password is not the same as old
		const isNewPasswordSameAsOld = await bcrypt.compare(newPassword, user.password);
		if (isNewPasswordSameAsOld) {
			return createResponse<ApiResponse>(
				{
					success: false,
					error: 'New password must be different from the current password',
				},
				400
			);
		}

		// Hash new password
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Update user password and remove reset token
		user.password = hashedPassword;
		await user.save();

		return createResponse<ApiResponse>({ success: true, message: 'Password changed.' }, 200);
	} catch (error) {
		console.error('Signup error:', error);
		return createResponse<ApiResponse>({ success: false, error: 'Internal Server Error' }, 500);
	}
}

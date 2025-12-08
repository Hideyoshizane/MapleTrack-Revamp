import argon2 from 'argon2';

import User from '@features/user/userModel';
import connectToDatabase from '@lib/mongooseConect';
import { changePasswordRequestSchema } from '@schemas/authSchemas';
import { createResponse } from '@utils/createResponse';
import { sanitizeInputBackEnd } from '@utils/sanitizeInputBackEnd';
import { validatePassword } from '@utils/validators';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		await connectToDatabase();

		// Validate request body using Zod
		const parseResult = changePasswordRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		// Sanitize input
		const [username, currentPassword, newPassword] = [
			parseResult.data.username,
			parseResult.data.currentPassword,
			parseResult.data.newPassword,
		].map(sanitizeInputBackEnd);
		if (!username || !currentPassword || !newPassword) {
			return createResponse<ApiResponse>({ success: false, message: 'Missing required fields' }, 400);
		}

		// Validate sanitized inputs
		const passwordValidation = validatePassword(newPassword);
		if (!passwordValidation.isValid) {
			const message = [passwordValidation.error].filter(Boolean).join('\n');
			return createResponse<ApiResponse>({ success: false, message: message }, 400);
		}

		// Find user by username
		const user = await User.findOne({ username });
		if (!user) return createResponse<ApiResponse>({ success: false, message: 'Invalid username' }, 404);

		// Check if current password matches
		const isCurrentPasswordCorrect = await argon2.verify(user.password, currentPassword);
		if (!isCurrentPasswordCorrect)
			return createResponse<ApiResponse>({ success: false, message: 'Current password is incorrect' }, 401);

		// Compare new password with hashed current password
		const isSamePassword = await argon2.verify(user.password, newPassword);
		if (isSamePassword) {
			createResponse<ApiResponse>(
				{ success: false, message: 'New password must be different from the current password' },
				400
			);
		}

		// Update user password
		user.password = await argon2.hash(newPassword, {
			type: argon2.argon2id,
		});
		await user.save();

		return createResponse<ApiResponse>({ success: true, message: 'Password changed.' }, 200);
	} catch (error) {
		console.error('Signup error:', error);
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

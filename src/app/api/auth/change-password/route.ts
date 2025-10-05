import bcrypt from 'bcrypt';

import connectToDatabase from '@lib/mongooseConect';
import User from '@models/user';
import { changePasswordRequestSchema } from '@schemas/authSchemas';
import { createResponse } from '@utils/api/createResponse';
import { sanitizeInputBackEnd } from '@utils/sanitize/sanitizeInputBackEnd';
import { validatePassword } from '@utils/validation/';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		await connectToDatabase();

		// Validate request body using Zod
		const parseResult = changePasswordRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, error: 'Invalid request body' }, 400);
		}

		// Sanitize input
		const [username, currentPassword, newPassword] = [
			parseResult.data.username,
			parseResult.data.currentPassword,
			parseResult.data.newPassword,
		].map(sanitizeInputBackEnd);
		if (!username || !currentPassword || !newPassword) {
			return createResponse<ApiResponse>({ success: false, error: 'Missing required fields' }, 400);
		}

		// Validate sanitized inputs
		const passwordValidation = validatePassword(newPassword);
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
		if (!user) return createResponse<ApiResponse>({ success: false, error: 'Invalid username' }, 404);

		// Check if current password matches
		const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
		if (!isCurrentPasswordCorrect)
			return createResponse<ApiResponse>({ success: false, error: 'Current password is incorrect' }, 401);

		// Compare new password with hashed current password
		if (await bcrypt.compare(newPassword, user.password)) {
			createResponse<ApiResponse>(
				{ success: false, error: 'New password must be different from the current password' },
				400
			);
		}

		// Update user password
		user.password = await bcrypt.hash(newPassword, 10);
		await user.save();

		return createResponse<ApiResponse>({ success: true, message: 'Password changed.' }, 200);
	} catch (error) {
		console.error('Signup error:', error);
		return createResponse<ApiResponse>({ success: false, error: 'Internal Server Error' }, 500);
	}
};

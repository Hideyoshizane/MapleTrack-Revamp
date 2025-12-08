import crypto from 'crypto';

import argon2 from 'argon2';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import User from '@features/user/userModel';
import connectToDatabase from '@lib/mongooseConect';
import { resetPasswordRequestSchema } from '@schemas/authSchemas';
import { createResponse } from '@utils/createResponse';
import { sanitizeInputBackEnd } from '@utils/sanitizeInputBackEnd';
import { validatePassword } from '@utils/validators';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextRequest, NextResponse } from 'next/server';

dayjs.extend(utc);

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		await connectToDatabase();

		// Validate request body with Zod
		const parseResult = resetPasswordRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		// Sanitize input
		const [sanitizedToken, sanitizedPassword] = [parseResult.data.token, parseResult.data.password].map(
			sanitizeInputBackEnd
		);
		if (!sanitizedToken || !sanitizedPassword) {
			return createResponse<ApiResponse>({ success: false, message: 'Missing required fields' }, 400);
		}

		// Validate sanitized inputs
		const passwordValidation = validatePassword(sanitizedPassword);
		if (!passwordValidation.isValid) {
			const message = [passwordValidation.error].filter(Boolean).join('\n');
			return createResponse<ApiResponse>({ success: false, message: message }, 400);
		}

		// Hash the token to compare against the hashed one stored in the DB
		const token = crypto.createHash('sha256').update(sanitizedToken).digest('hex');

		// Find user with matching reset token
		const user = await User.findOne({ resetPasswordToken: token });
		if (!user || !user.resetPasswordExpires || dayjs.utc(user.resetPasswordExpires).isBefore(dayjs.utc())) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid or expired token' }, 404);
		}

		// Compare new password with current one
		const isSamePassword = await argon2.verify(user.password, sanitizedPassword);
		if (isSamePassword) {
			return createResponse<ApiResponse>(
				{ success: false, message: 'New password must be different from the current password' },
				400
			);
		}

		// Update user password and remove reset token
		const hashedPassword = await argon2.hash(sanitizedPassword, {
			type: argon2.argon2id,
		});

		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;
		await user.save();

		return createResponse<ApiResponse>({ success: true, message: 'Password reset successfully.' }, 200);
	} catch (error) {
		console.error('Signup error:', error);
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

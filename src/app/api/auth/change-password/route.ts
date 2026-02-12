import argon2 from 'argon2';
import { getToken } from 'next-auth/jwt';

import { prisma } from '@lib/prisma';
import { changePasswordRequestSchema } from '@schemas/auth.schemas';
import { createResponse } from '@utils/createResponse';
import { validatePassword } from '@utils/validators';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		// Extract token from the request cookies
		const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

		if (!token || typeof token.id !== 'string') {
			return createResponse<ApiResponse>({ success: false, message: 'Unauthorized' }, 401);
		}

		const authenticatedUserId = token.id;

		// Validate request body using Zod
		const parseResult = changePasswordRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const { currentPassword, newPassword } = parseResult.data;

		// Validate sanitized inputs
		const passwordValidation = validatePassword(newPassword);
		if (!passwordValidation.isValid) {
			const message = [passwordValidation.error].filter(Boolean).join('\n');
			return createResponse<ApiResponse>({ success: false, message: message }, 400);
		}

		// Find user by username
		const user = await prisma.user.findUnique({
			where: { id: authenticatedUserId },
			select: {
				id: true,
				password: true,
			},
		});
		if (!user) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid username' }, 404);
		}

		// Check if current password matches
		const isCurrentPasswordCorrect = await argon2.verify(user.password, currentPassword);
		if (!isCurrentPasswordCorrect) {
			return createResponse<ApiResponse>({ success: false, message: 'Current password is incorrect' }, 401);
		}

		// Compare new password with hashed current password
		const isSamePassword = await argon2.verify(user.password, newPassword);
		if (isSamePassword) {
			createResponse<ApiResponse>(
				{ success: false, message: 'New password must be different from the current password' },
				400,
			);
		}

		// Update user password
		const hashedPassword = await argon2.hash(newPassword, {
			type: argon2.argon2id,
		});

		await prisma.user.update({
			where: { id: user.id },
			data: {
				password: hashedPassword,
			},
		});

		return createResponse<ApiResponse>({ success: true, message: 'Password changed.' }, 200);
	} catch (error) {
		console.error('password_change_failed', { error: error instanceof Error ? error.message : 'unknown' });
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

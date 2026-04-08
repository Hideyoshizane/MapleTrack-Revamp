import argon2 from 'argon2';

import { changePasswordRequestSchema } from '@features/user/schemas/user.schema';
import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logError, logApiFailure, logZodError } from '@utils/logger';
import { validatePassword } from '@utils/validators';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextRequest, NextResponse } from 'next/server';

const route = '/api/auth/change-password';

const handler = async (request: NextRequest, authenticatedUserId: string): Promise<NextResponse> => {
	try {
		const parseResult = changePasswordRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			logZodError(parseResult.error, { route: route });
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}
		const { currentPassword, newPassword } = parseResult.data;
		const passwordValidation = validatePassword(newPassword);
		if (!passwordValidation.isValid) {
			const message = [passwordValidation.error].filter(Boolean).join('\n');

			logApiFailure(message, { route: route });
			return createResponse<ApiResponse>({ success: false, message: message }, 400);
		}

		// Find user by id
		const user = await prisma.user.findUnique({
			where: { id: authenticatedUserId },
			select: { id: true, password: true },
		});
		if (!user) {
			logApiFailure('User not found', { route: route });
			return createResponse<ApiResponse>({ success: false, message: 'Invalid username' }, 404);
		}

		const isCurrentPasswordCorrect = await argon2.verify(user.password, currentPassword);
		if (!isCurrentPasswordCorrect) {
			logApiFailure('Password error', { route: route });
			return createResponse<ApiResponse>({ success: false, message: 'Current password is incorrect' }, 401);
		}

		const isSamePassword = await argon2.verify(user.password, newPassword);
		if (isSamePassword) {
			logApiFailure('Password error', { route: route });
			createResponse<ApiResponse>(
				{ success: false, message: 'New password must be different from the current password' },
				400,
			);
		}

		// Update user password
		const hashedPassword = await argon2.hash(newPassword, { type: argon2.argon2id });
		await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });

		return createResponse<ApiResponse>({ success: true, message: 'Password changed.' }, 200);
	} catch (error) {
		logError(error, { route: route });
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const POST = routeGuard(handler);

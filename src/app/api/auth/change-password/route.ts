import { changePasswordRequestSchema } from '@features/user/schemas/user.schema';
import { prisma } from '@lib/prisma';
import { verifyPassword, hashPassword } from '@lib/security/password';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logError, logApiFailure, logZodError } from '@utils/logger';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextRequest, NextResponse } from 'next/server';

const route = '/api/auth/change-password';

const handler = async (request: NextRequest, authenticatedUserId: string): Promise<NextResponse> => {
	try {
		const parseResult = changePasswordRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			logZodError(parseResult.error, { route });

			const message = parseResult.error.issues[0]?.message ?? 'Validation failed';

			return createResponse<ApiResponse>({ success: false, message }, 200);
		}

		const { currentPassword, newPassword } = parseResult.data;

		// Find user by id
		const user = await prisma.user.findUnique({
			where: { id: authenticatedUserId },
			select: { id: true, password: true },
		});
		if (!user) {
			logApiFailure('User not found', { route: route });

			return createResponse<ApiResponse>({ success: false, message: 'Invalid username' }, 404);
		}

		const isCurrentPasswordCorrect = await verifyPassword(user.password, currentPassword);
		if (!isCurrentPasswordCorrect) {
			logApiFailure('Password error', { route: route });

			return createResponse<ApiResponse>({ success: false, message: 'Current password is incorrect.' }, 200);
		}

		const isSamePassword = await verifyPassword(user.password, newPassword);
		if (isSamePassword) {
			logApiFailure('Password error', { route: route });

			return createResponse<ApiResponse>(
				{ success: false, message: 'New password must be different from the current password.' },
				200,
			);
		}

		// Update user password
		const hashedPassword = await hashPassword(newPassword);
		await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });

		return createResponse<ApiResponse>({ success: true, message: 'Password changed.' }, 200);
	} catch (error) {
		logError(error, { route: route });

		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const POST = routeGuard(handler);

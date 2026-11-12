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

		// Find the user's credential account
		const account = await prisma.account.findFirst({
			where: { userId: authenticatedUserId, providerId: 'credential' },
			select: { id: true, password: true },
		});

		if (!account?.password) {
			logApiFailure('Credential account not found', { route });

			return createResponse<ApiResponse>({ success: false, message: 'Credential account not found.' }, 404);
		}

		// Verify current password
		const isCurrentPasswordCorrect = await verifyPassword(account.password, currentPassword);
		if (!isCurrentPasswordCorrect) {
			logApiFailure('Password error', { route });

			return createResponse<ApiResponse>({ success: false, message: 'Current password is incorrect.' }, 200);
		}

		// Prevent reusing the current password
		const isSamePassword = await verifyPassword(account.password, newPassword);
		if (isSamePassword) {
			logApiFailure('Password error', { route });

			return createResponse<ApiResponse>(
				{ success: false, message: 'New password must be different from the current password.' },
				200,
			);
		}

		// Update credential account password
		const hashedPassword = await hashPassword(newPassword);

		await prisma.account.update({ where: { id: account.id }, data: { password: hashedPassword } });

		return createResponse<ApiResponse>({ success: true, message: 'Password changed.' }, 200);
	} catch (error) {
		logError(error, { route });

		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const POST = routeGuard(handler);

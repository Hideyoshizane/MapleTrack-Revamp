import crypto from 'crypto';

import { resetPasswordRequestSchema } from '@features/user/schemas/user.schema';
import { prisma } from '@lib/prisma';
import { verifyPassword, hashPassword } from '@lib/security/password';
import { createResponse } from '@utils/createResponse';
import { logError, logApiFailure, logZodError } from '@utils/logger';
import { nowInUtc } from '@utils/time';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextRequest, NextResponse } from 'next/server';

const route = '/api/account/reset-password';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		const parseResult = resetPasswordRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			logZodError(parseResult.error, { route: route });

			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const { token, password } = parseResult.data;
		const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');
		const now = nowInUtc();

		const result = await prisma.$transaction(async (tx) => {
			const user = await tx.user.findFirst({
				where: { resetPasswordToken: hashedToken, resetPasswordExpires: { gt: now } },
				select: { id: true, password: true },
			});
			if (!user) {
				return { status: 'invalid' };
			}

			const isSamePassword = await verifyPassword(user.password, password);
			if (isSamePassword) {
				return { status: 'same_password' as const };
			}

			const hashedPassword = await hashPassword(password);
			await tx.user.update({
				where: { id: user.id, resetPasswordToken: hashedToken, resetPasswordExpires: { gt: now } },
				data: { password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null },
			});

			return { status: 'success' as const };
		});

		if (result.status === 'invalid') {
			logApiFailure('Invalid or expired token', { route: route });

			return createResponse<ApiResponse>({ success: false, message: 'Invalid or expired token' }, 404);
		}

		if (result.status === 'same_password') {
			logApiFailure('New password same as current', { route: route });

			return createResponse<ApiResponse>(
				{ success: false, message: 'New password must be different from the current password' },
				400,
			);
		}

		return createResponse<ApiResponse>({ success: true, message: 'Password reset successfully.' }, 200);
	} catch (error) {
		logError(error, { route: route });

		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

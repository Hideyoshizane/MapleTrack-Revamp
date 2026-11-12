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
			logZodError(parseResult.error, { route });
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const { token, password } = parseResult.data;
		const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

		const result = await prisma.$transaction(async (tx) => {
			const user = await tx.user.findFirst({
				where: { resetPasswordToken: hashedToken, resetPasswordExpires: { gt: nowInUtc() } },
				select: {
					id: true,
					accounts: { where: { providerId: 'credential' }, select: { id: true, password: true }, take: 1 },
				},
			});

			const account = user?.accounts[0];
			if (!user || !account?.password) {
				return 'invalid' as const;
			}

			if (await verifyPassword(account.password, password)) return 'same_password' as const;

			const update = await tx.user.updateMany({
				where: { id: user.id, resetPasswordToken: hashedToken, resetPasswordExpires: { gt: nowInUtc() } },
				data: { resetPasswordToken: null, resetPasswordExpires: null },
			});
			if (update.count !== 1) {
				return 'invalid' as const;
			}

			await tx.account.update({ where: { id: account.id }, data: { password: await hashPassword(password) } });

			return 'success' as const;
		});

		if (result === 'invalid') {
			logApiFailure('Invalid or expired token', { route });
			return createResponse<ApiResponse>({ success: false, message: 'Invalid or expired token' }, 404);
		}

		if (result === 'same_password') {
			logApiFailure('New password same as current', { route });
			return createResponse<ApiResponse>(
				{ success: false, message: 'New password must be different from the current password' },
				400,
			);
		}

		return createResponse<ApiResponse>({ success: true, message: 'Password reset successfully.' }, 200);
	} catch (error) {
		logError(error, { route });
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

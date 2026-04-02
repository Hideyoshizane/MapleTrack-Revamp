import crypto from 'crypto';

import argon2 from 'argon2';
import dayjs from 'dayjs';

import { resetPasswordRequestSchema } from '@features/user/schemas/user.schema';
import { prisma } from '@lib/prisma';
import { createResponse } from '@utils/createResponse';
import { logError, logApiFailure, logZodError } from '@utils/logger';
import { validatePassword } from '@utils/validators';

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

		const normalizedToken = parseResult.data.token.trim();
		const newPassword = parseResult.data.password;

		const passwordValidation = validatePassword(newPassword);
		if (!passwordValidation.isValid) {
			const message = [passwordValidation.error].filter(Boolean).join('\n');

			logApiFailure(message, { route: route });
			return createResponse<ApiResponse>({ success: false, message: message }, 400);
		}

		const hashedToken = crypto.createHash('sha256').update(normalizedToken).digest('hex');

		const result = await prisma.$transaction(async (tx) => {
			const user = await tx.user.findFirst({
				where: { resetPasswordToken: hashedToken, resetPasswordExpires: { gt: dayjs.utc().toDate() } },
				select: { id: true, password: true },
			});

			if (!user) {
				return { status: 'invalid' };
			}

			let isSamePassword = false;
			try {
				isSamePassword = await argon2.verify(user.password, newPassword);
			} catch {
				return { status: 'invalid' };
			}

			if (isSamePassword) {
				return { status: 'same_password' };
			}

			const hashedPassword = await argon2.hash(newPassword, { type: argon2.argon2id });
			await tx.user.update({
				where: { id: user.id, resetPasswordToken: hashedToken, resetPasswordExpires: { gt: dayjs.utc().toDate() } },
				data: { password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null },
			});

			return { status: 'success' };
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

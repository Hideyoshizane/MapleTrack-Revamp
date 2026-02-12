import crypto from 'crypto';

import argon2 from 'argon2';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { resetPasswordRequestSchema } from '@/schemas/auth.schemas';
import { prisma } from '@lib/prisma';
import { createResponse } from '@utils/createResponse';
import { validatePassword } from '@utils/validators';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextRequest, NextResponse } from 'next/server';

dayjs.extend(utc);

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		// Validate request body with Zod
		const parseResult = resetPasswordRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const normalizedToken = parseResult.data.token.trim();
		const newPassword = parseResult.data.password;

		// Validate sanitized inputs
		const passwordValidation = validatePassword(newPassword);
		if (!passwordValidation.isValid) {
			const message = [passwordValidation.error].filter(Boolean).join('\n');
			return createResponse<ApiResponse>({ success: false, message: message }, 400);
		}

		// Hash the token to compare against the hashed one stored in the DB
		const hashedToken = crypto.createHash('sha256').update(normalizedToken).digest('hex');

		const result = await prisma.$transaction(async (tx) => {
			const user = await tx.user.findFirst({
				where: {
					resetPasswordToken: hashedToken,
					resetPasswordExpires: { gt: new Date() },
				},
				select: {
					id: true,
					password: true,
				},
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

			const updateResult = await tx.user.updateMany({
				where: {
					id: user.id,
					resetPasswordToken: hashedToken,
					resetPasswordExpires: { gt: new Date() },
				},
				data: {
					password: hashedPassword,
					resetPasswordToken: null,
					resetPasswordExpires: null,
				},
			});

			if (updateResult.count !== 1) {
				return { status: 'invalid' };
			}

			return { status: 'success' };
		});

		if (result.status === 'invalid') {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid or expired token' }, 404);
		}

		if (result.status === 'same_password') {
			return createResponse<ApiResponse>(
				{
					success: false,
					message: 'New password must be different from the current password',
				},
				400,
			);
		}

		return createResponse<ApiResponse>({ success: true, message: 'Password reset successfully.' }, 200);
	} catch (error) {
		console.error('Signup error:', error);
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

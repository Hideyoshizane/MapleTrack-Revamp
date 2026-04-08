import crypto from 'crypto';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { forgotPasswordRequestSchema } from '@features/user/schemas/user.schema';
import { prisma } from '@lib/prisma';
import { sendEmail } from '@lib/sendEmail';
import getForgotPasswordTemplate from '@lib/template/resetPasswordEmailTemplate';
import { createResponse } from '@utils/createResponse';
import { logError, logApiFailure, logZodError } from '@utils/logger';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!BASE_URL) {
	throw new Error('NEXT_PUBLIC_BASE_URL is not defined');
}

dayjs.extend(utc);

const route = '/api/auth/forgot-password';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		// Validate request body with zod
		const parseResult = forgotPasswordRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			logZodError(parseResult.error, { route: route });
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}
		const email = parseResult.data.email;

		// search for user by the email
		const user = await prisma.user.findUnique({ where: { email }, select: { id: true, username: true } });
		if (!user) {
			logApiFailure('User not found for forgot password', { route: route, additional: { email } });
			return createResponse<ApiResponse>({ success: true, message: 'If the email exists, we sent a reset link.' }, 200);
		}

		const rawToken = crypto.randomBytes(32).toString('hex');
		const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

		// Expiration: 15 minutes from now (UTC)
		const resetPasswordExpires = dayjs().add(15, 'minute').utc().toDate();

		const resetUrl = `${BASE_URL}/reset-password?token=${rawToken}`;
		const html = getForgotPasswordTemplate(resetUrl, user.username);

		try {
			await sendEmail({ to: email, subject: 'Reset Your Password', html });
		} catch (emailError) {
			logApiFailure('Failed to send reset email', {
				route,
				userId: user.id,
				additional: { error: emailError instanceof Error ? emailError.message : String(emailError) },
			});
			return createResponse<ApiResponse>({ success: false, message: 'Failed to send reset email' }, 500);
		}

		// Persist reset token
		await prisma.user.update({
			where: { id: user.id },
			data: { resetPasswordToken: hashedToken, resetPasswordExpires },
		});

		return createResponse<ApiResponse>({ success: true, message: 'If the email exists, we sent a reset link.' }, 200);
	} catch (error) {
		logError(error, { route: route });
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

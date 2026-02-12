import crypto from 'crypto';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { forgotPasswordRequestSchema } from '@/schemas/auth.schemas';
import { prisma } from '@lib/prisma';
import { sendEmail } from '@lib/sendEmail';
import getForgotPasswordTemplate from '@lib/template/resetPasswordEmailTemplate';
import { createResponse } from '@utils/createResponse';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!BASE_URL) {
	throw new Error('NEXT_PUBLIC_BASE_URL is not defined');
}

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		dayjs.extend(utc);

		// Validate request body with zod
		const parseResult = forgotPasswordRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const email = parseResult.data.email;

		// search for user by the email
		const user = await prisma.user.findUnique({
			where: { email },
			select: {
				id: true,
				username: true,
			},
		});
		if (!user) {
			return createResponse<ApiResponse>({ success: true, message: 'If the email exists, we sent a reset link.' }, 200);
		}

		// Generate raw token
		const rawToken = crypto.randomBytes(32).toString('hex');
		const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

		// Expiration: 15 minutes from now (UTC)
		const resetPasswordExpires = dayjs().add(15, 'minute').utc().toDate();

		const resetUrl = `${BASE_URL}/reset-password?token=${rawToken}`;
		const html = getForgotPasswordTemplate(resetUrl, user.username);

		try {
			await sendEmail({
				to: email,
				subject: 'Reset Your Password',
				html,
			});
		} catch (emailError) {
			console.error('forgot_password_email_failed', {
				error: emailError instanceof Error ? emailError.message : 'unknown',
				userId: user.id,
			});

			return createResponse<ApiResponse>({ success: false, message: 'Failed to send reset email' }, 500);
		}

		// Persist reset token atomically
		await prisma.user.update({
			where: { id: user.id },
			data: {
				resetPasswordToken: hashedToken,
				resetPasswordExpires,
			},
		});

		return createResponse<ApiResponse>({ success: true, message: 'If the email exists, we sent a reset link.' }, 200);
	} catch (error) {
		console.error('forgot_password_failed', { error: error instanceof Error ? error.message : 'unknown' });

		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

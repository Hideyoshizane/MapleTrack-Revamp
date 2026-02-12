import { getToken } from 'next-auth/jwt';

import { prisma } from '@lib/prisma';
import { createResponse } from '@utils/createResponse';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextRequest, NextResponse } from 'next/server';

export const DELETE = async (request: NextRequest): Promise<NextResponse> => {
	try {
		// Extract token from the request cookies
		const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

		if (!token || typeof token.id !== 'string') {
			return createResponse<ApiResponse>({ success: false, message: 'Unauthorized' }, 401);
		}

		const authenticatedUserId = token.id;

		// Find user by username
		const existingUser = await prisma.user.findUnique({
			where: { id: authenticatedUserId },
			select: { id: true },
		});

		if (!existingUser) {
			return createResponse<ApiResponse>({ success: false, message: 'Unauthorized' }, 401);
		}

		await prisma.user.delete({
			where: { id: authenticatedUserId },
		});

		return createResponse<ApiResponse>(
			{ success: true, message: 'Account and related data deleted successfully.' },
			200,
		);
	} catch (error) {
		console.error('account_delete_failed', { error: error instanceof Error ? error.message : 'unknown' });
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

import { getToken } from 'next-auth/jwt';

import { prisma } from '@lib/prisma';
import { createResponse } from '@utils/createResponse';
import { logError, logApiFailure } from '@utils/logger';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextRequest, NextResponse } from 'next/server';

const route = '/api/account/delete';

export const DELETE = async (request: NextRequest): Promise<NextResponse> => {
	try {
		// Extract token from the request cookies
		const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
		if (!token || typeof token.id !== 'string') {
			logApiFailure('Unauthorized error', { route: route });
			return createResponse<ApiResponse>({ success: false, message: 'Unauthorized' }, 401);
		}

		const authenticatedUserId = token.id;

		// Find user by id
		const existingUser = await prisma.user.findUnique({ where: { id: authenticatedUserId }, select: { id: true } });
		if (!existingUser) {
			logApiFailure('User not found error', { route: route });
			return createResponse<ApiResponse>({ success: false, message: 'Unauthorized' }, 401);
		}
		// Delete all related to user in cascade
		await prisma.user.delete({ where: { id: authenticatedUserId } });

		return createResponse<ApiResponse>(
			{ success: true, message: 'Account and related data deleted successfully.' },
			200,
		);
	} catch (error) {
		logError(error, { route: route });
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

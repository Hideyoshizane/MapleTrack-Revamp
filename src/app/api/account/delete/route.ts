import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logError, logApiFailure } from '@utils/logger';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextRequest, NextResponse } from 'next/server';

const route = '/api/account/delete';

const handler = async (_request: NextRequest, authenticatedUserId: string): Promise<NextResponse> => {
	try {
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

export const DELETE = routeGuard(handler);

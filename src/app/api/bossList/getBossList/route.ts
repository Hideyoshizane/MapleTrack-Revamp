import { getToken } from 'next-auth/jwt';

import { BossListRequestSchema } from '@features/Boss/bossListSchema';
import { prisma } from '@lib/prisma';
import { createResponse } from '@utils/createResponse';

import type { GetBossListResponse } from '@features/Boss/bossListApi';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		// Extract token from the request cookies
		const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

		if (!token || typeof token.id !== 'string') {
			return createResponse<ApiResponse>({ success: false, message: 'Unauthorized' }, 401);
		}

		const authenticatedUserId = token.id;

		let body: unknown;
		try {
			body = await request.json();
		} catch {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		// Validate request body using Zod
		const parseResult = BossListRequestSchema.safeParse(body);
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const { server } = parseResult.data;

		// Query BossList and return only the requested server
		const bossList = await prisma.bossList.findUnique({
			where: { userId: authenticatedUserId },
			select: {
				servers: {
					where: { name: server },
					select: {
						name: true,
						weeklyBosses: true,
						totalGains: true,
						characters: {
							select: {
								name: true,
								code: true,
								class: true,
								level: true,
								totalIncome: true,
								bosses: {
									select: {
										name: true,
										difficulty: true,
										reset: true,
										dailyTotal: true,
										date: true,
										cleared: true,
										locked: true,
									},
								},
							},
						},
					},
				},
			},
		});

		if (!bossList || bossList.servers.length === 0) {
			return createResponse<ApiResponse>({ success: false, message: 'Boss List not found.' }, 404);
		}
		// Extract the requested server
		const serverData = bossList.servers[0];

		// Success response
		return createResponse<ApiResponse<GetBossListResponse>>(
			{ success: true, message: 'Boss List found.', data: serverData },
			200,
		);
	} catch (error) {
		console.error('boss_list_fetch_failed', { error: error instanceof Error ? error.message : 'unknown' });

		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

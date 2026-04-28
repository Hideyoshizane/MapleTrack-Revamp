import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { getBossDifficultyValue } from '@data/bosses/bosses';
import { toggleBossListRequestSchema } from '@features/boss/schemas/bossList.request.schema';
import { toggleBossListResponseSchema } from '@features/boss/schemas/bossList.response.schema';
import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logZodError, logApiFailure, logError } from '@utils/logger';

import type { toggleBossListResponseBody } from '@features/boss/schemas/bossList.response.schema';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

dayjs.extend(utc);

const route = 'api/bossList/toggleBossList';

const handler = async (request: NextRequest, authenticatedUserId: string): Promise<NextResponse> => {
	try {
		const parseResult = toggleBossListRequestSchema.safeParse(await request.json());

		if (!parseResult.success) {
			logZodError(parseResult.error, { route });
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const data = parseResult.data;

		const bossData = await prisma.boss.findFirst({
			where: {
				id: data.bossMonsterId,
				character: { server: { bossList: { userId: authenticatedUserId } } },
			},
			select: {
				id: true,
				name: true,
				difficulty: true,
				cleared: true,
				locked: true,
				character: {
					select: { server: { select: { id: true, serverName: true, bossList: { select: { id: true } } } } },
				},
			},
		});

		if (!bossData) {
			logApiFailure('Boss Data not found', { route });
			return createResponse<ApiResponse>({ success: false, message: 'Boss data not found' }, 404);
		}

		const server = bossData.character.server;

		if (!server) {
			logApiFailure('Server Data not found', { route });
			return createResponse<ApiResponse>({ success: false, message: 'server data not found' }, 404);
		}

		const bossList = server.bossList;

		if (!bossList) {
			logApiFailure('Boss List not found', { route });
			return createResponse<ApiResponse>({ success: false, message: 'Boss list not found' }, 404);
		}

		const now = dayjs().utc().toDate();

		const responseData = await prisma.$transaction(async (tx) => {
			const currentBoss = await tx.boss.findUnique({
				where: { id: data.bossMonsterId },
				select: { id: true, cleared: true, locked: true },
			});

			if (!currentBoss) {
				throw new Error('Boss not found during transaction');
			}

			if (currentBoss.locked) {
				throw new Error('BOSS_LOCKED');
			}

			const willBeCleared = !currentBoss.cleared;
			const sign = willBeCleared ? 1 : -1;

			const bossValue = getBossDifficultyValue(bossData.name, bossData.difficulty, server.serverName);

			const bossValueWithSign = bossValue * sign;

			await tx.boss.update({
				where: { id: data.bossMonsterId },
				data: { cleared: willBeCleared },
			});

			await tx.bossServer.update({
				where: { id: server.id },
				data: { weeklyBosses: { increment: sign }, totalGains: { increment: bossValueWithSign } },
			});

			await tx.bossList.update({ where: { id: bossList.id }, data: { lastUpdate: now } });

			return {
				weeklyBossesUpdate: sign,
				totalGainUpdate: bossValueWithSign,
			};
		});

		const validation = toggleBossListResponseSchema.safeParse(responseData);

		if (!validation.success) {
			logZodError(validation.error, { route });
			throw new Error('Invalid Boss List data');
		}

		return createResponse<ApiResponse<toggleBossListResponseBody>>(
			{ success: true, message: 'Boss list updated successfully', data: responseData },
			200,
		);
	} catch (error) {
		if (error instanceof Error && error.message === 'BOSS_LOCKED') {
			return createResponse<ApiResponse>({ success: false, message: 'Boss is locked' }, 403);
		}

		logError(error, { route });
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const POST = routeGuard(handler);

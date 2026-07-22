import { getBossDifficultyValue } from '@data/bosses/bosses';
import { toggleBossListRequestSchema } from '@features/boss/schemas/bossList.request.schema';
import { toggleBossListResponseSchema } from '@features/boss/schemas/bossList.response.schema';
import { addPointsToLiberation } from '@features/liberation/liberationService';
import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logZodError, logApiFailure, logError } from '@utils/logger';
import { nowInUtc } from '@utils/time';

import type { toggleBossListResponseBody } from '@features/boss/schemas/bossList.response.schema';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

const route = 'api/bossList/toggleBossList';

const handler = async (request: NextRequest, authenticatedUserId: string): Promise<NextResponse> => {
	try {
		const parseResult = toggleBossListRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			logZodError(parseResult.error, { route });

			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const { bossMonsterId } = parseResult.data;

		const bossData = await prisma.boss.findFirst({
			where: { id: bossMonsterId, character: { server: { bossList: { userId: authenticatedUserId } } } },
			select: {
				id: true,
				name: true,
				difficulty: true,
				cleared: true,
				locked: true,
				partySize: true,
				character: {
					select: {
						characterId: true,
						server: { select: { id: true, serverName: true, bossList: { select: { id: true } } } },
					},
				},
			},
		});

		if (!bossData) {
			logApiFailure('Boss Data not found', { route });

			return createResponse<ApiResponse>({ success: false, message: 'Boss data not found' }, 404);
		}

		if (bossData.locked) {
			return createResponse<ApiResponse>({ success: false, message: 'Boss is locked' }, 403);
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

		const willBeCleared = !bossData.cleared;
		const sign = willBeCleared ? 1 : -1;

		const bossValue = getBossDifficultyValue(bossData.name, bossData.difficulty, server.serverName);
		if (bossValue === null) {
			logApiFailure('Boss value not found', { route });

			return createResponse<ApiResponse>({ success: false, message: 'Boss value not found' }, 404);
		}
		const adjustedBossValue = Math.round(bossValue / bossData.partySize);
		const bossValueWithSign = adjustedBossValue * sign;

		const responseData = await prisma.$transaction(async (tx) => {
			await Promise.all([
				tx.boss.update({ where: { id: bossMonsterId }, data: { cleared: willBeCleared } }),

				tx.bossServer.update({
					where: { id: server.id },
					data: { weeklyBosses: { increment: sign }, totalGains: { increment: bossValueWithSign } },
				}),

				tx.bossList.update({ where: { id: bossList.id }, data: { lastUpdate: nowInUtc() } }),
			]);

			const liberationPoints = await addPointsToLiberation(
				tx,
				bossData.name,
				bossData.difficulty,
				bossData.partySize,
				sign,
				authenticatedUserId,
				bossData.character.characterId,
				server.serverName,
			);

			return {
				weeklyBossesUpdate: sign,
				totalGainUpdate: bossValueWithSign,
				bossType: liberationPoints.bossType,
				liberationPoints: liberationPoints.points,
				astraVestigesPoints: liberationPoints.astra?.vestiges ?? null,
				astraTracesPoints: liberationPoints.astra?.traces ?? null,
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
		logError(error, { route });

		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const POST = routeGuard(handler);

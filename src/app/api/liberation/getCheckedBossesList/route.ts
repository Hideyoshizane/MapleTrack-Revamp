import { getBossesByType } from '@data/liberation/liberationBosses';
import { getCheckedBossesListRequestSchema } from '@features/liberation/schemas/liberation.request.schema';
import { getCheckedBossesListResponseSchema } from '@features/liberation/schemas/liberation.response.schema';
import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logZodError, logError, logApiFailure } from '@utils/logger';
import { isSameDay } from '@utils/time';

import type { getCheckedBossesListResponseBody } from '@features/liberation/schemas/liberation.response.schema';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

const route = 'api/liberation/getCheckedBossesList';

const handler = async (request: NextRequest, authenticatedUserId: string): Promise<NextResponse> => {
	try {
		// Validate request body using Zod
		const parseResult = getCheckedBossesListRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			logZodError(parseResult.error, { route: route });

			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const { server, characterId, type, requestDate } = parseResult.data;

		const characterBossData = await prisma.bossCharacter.findFirst({
			where: { characterId, server: { serverName: server, bossList: { userId: authenticatedUserId } } },
			select: {
				bosses: { select: { name: true, difficulty: true, cleared: true, partySize: true } },
				server: { select: { bossList: { select: { lastUpdate: true } } } },
			},
		});

		if (!characterBossData) {
			logApiFailure('Boss List not found', { route });

			return createResponse<ApiResponse>({ success: false, message: 'Boss List not found.' }, 200);
		}

		const lastUpdate = characterBossData.server.bossList?.lastUpdate;
		const isCurrentDay = lastUpdate !== null && lastUpdate !== undefined && isSameDay(lastUpdate, requestDate);

		const bosses = getBossesByType(type);

		const bossesMap = new Map(
			characterBossData.bosses.map((boss): [string, (typeof characterBossData.bosses)[number]] => [
				boss.name,
				boss,
			]),
		);

		// Build response object
		const normalizedBosses: getCheckedBossesListResponseBody = Array.from({ length: bosses.length });

		for (let bossIndex = 0; bossIndex < bosses.length; bossIndex += 1) {
			const boss = bosses[bossIndex];
			const existingBoss = bossesMap.get(boss.name);

			if (!isCurrentDay) {
				normalizedBosses[bossIndex] = {
					name: boss.name,
					type: 'Skip',
					cleared: false,
					partySize: existingBoss?.partySize ?? 1,
				};

				continue;
			}

			normalizedBosses[bossIndex] = {
				name: boss.name,
				type: existingBoss?.difficulty ?? 'Skip',
				cleared: existingBoss?.cleared ?? false,
				partySize: existingBoss?.partySize ?? 1,
			};
		}

		const validation = getCheckedBossesListResponseSchema.safeParse(normalizedBosses);
		if (!validation.success) {
			logZodError(validation.error, { route });

			throw new Error('Invalid Liberation List data');
		}

		// Success response
		return createResponse<ApiResponse<getCheckedBossesListResponseBody>>(
			{ success: true, message: 'List found.', data: normalizedBosses },
			200,
		);
	} catch (error) {
		logError(error, { route: route });
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const POST = routeGuard(handler);

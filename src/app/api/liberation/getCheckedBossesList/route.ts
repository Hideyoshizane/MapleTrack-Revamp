import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { getBossesByType } from '@data/liberation/liberationBosses';
import { getCheckedBossesListRequestSchema } from '@features/liberation/schemas/liberation.request.schema';
import { getCheckedBossesListResponseSchema } from '@features/liberation/schemas/liberation.response.schema';
import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logZodError, logError, logApiFailure } from '@utils/logger';

import type { getCheckedBossesListResponseBody } from '@features/liberation/schemas/liberation.response.schema';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

dayjs.extend(utc);

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

		const bossList = await prisma.bossList.findUnique({
			where: { userId: authenticatedUserId },
			select: {
				lastUpdate: true,
				servers: {
					where: { serverName: server },
					select: {
						characters: {
							where: { characterId: characterId },
							select: { bosses: { select: { name: true, difficulty: true, cleared: true } } },
						},
					},
				},
			},
		});

		if (!bossList || bossList.servers.length === 0) {
			logApiFailure('Boss List not found', { route });
			return createResponse<ApiResponse>({ success: false, message: 'Boss List not found.' }, 200);
		}

		const lastUpdate = bossList.lastUpdate;
		const isSameDay = lastUpdate && dayjs(lastUpdate).isSame(dayjs(requestDate), 'day');

		const characterBosses = bossList.servers[0]?.characters[0]?.bosses ?? [];
		const bosses = getBossesByType(type);

		const bossesMap = new Map(characterBosses.map((boss) => [boss.name, boss]));

		// Build response object
		const normalizedBosses: Array<{ name: string; type: string }> = [];

		for (const boss of bosses) {
			if (!isSameDay) {
				normalizedBosses.push({ name: boss.name, type: 'Skip' });
				continue;
			}

			const dbBoss = bossesMap.get(boss.name);

			if (!dbBoss) {
				normalizedBosses.push({ name: boss.name, type: 'Skip' });
				continue;
			}

			normalizedBosses.push({ name: boss.name, type: dbBoss.cleared ? dbBoss.difficulty : 'Skip' });
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

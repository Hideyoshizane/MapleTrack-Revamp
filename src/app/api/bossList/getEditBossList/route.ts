import { getEditBossListRequestSchema } from '@features/boss/schemas/bossList.request.schema';
import { getEditBossListResponseSchema } from '@features/boss/schemas/bossList.response.schema';
import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logZodError, logError } from '@utils/logger';

import type { getEditBossListResponseBody } from '@features/boss/schemas/bossList.response.schema';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

const route = 'api/bossList/getBossList';

const handler = async (request: NextRequest, authenticatedUserId: string): Promise<NextResponse> => {
	try {
		// Validate request body using Zod
		const parseResult = getEditBossListRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			logZodError(parseResult.error, { route: route });

			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const { server } = parseResult.data;

		// Query BossList and return only the requested server
		const bossList = await prisma.bossList.findUnique({
			where: { userId: authenticatedUserId },
			select: {
				servers: {
					where: { serverName: server },
					select: {
						id: true,
						weeklyBosses: true,
						totalGains: true,
						characters: {
							select: {
								characterId: true,
								character: { select: { name: true, class: true, level: true } },
								totalIncome: true,
								bosses: { select: { name: true, difficulty: true, reset: true, dailyTotal: true } },
							},
						},
					},
				},
			},
		});
		if (!bossList || bossList.servers.length === 0) {
			return createResponse<ApiResponse>({ success: false, message: 'Boss List not found.' }, 200);
		}

		const serverDataRaw = bossList?.servers[0];

		const characters: getEditBossListResponseBody['characters'] = [];

		for (const characterEntry of serverDataRaw.characters) {
			const characterData = characterEntry.character;

			if (!characterData) {
				continue;
			}

			const bosses = new Array(characterEntry.bosses.length);

			for (let index = 0; index < characterEntry.bosses.length; index += 1) {
				const boss = characterEntry.bosses[index];

				bosses[index] = {
					name: boss.name,
					difficulty: boss.difficulty,
					reset: boss.reset,
					dailyTotal: boss.dailyTotal ?? 0,
				};
			}

			characters.push({
				characterId: characterEntry.characterId,
				name: characterData.name,
				class: characterData.class,
				level: characterData.level,
				totalIncome: characterEntry.totalIncome,
				bosses,
			});
		}

		const serverData: getEditBossListResponseBody = {
			id: serverDataRaw.id,
			weeklyBosses: serverDataRaw.weeklyBosses,
			characters,
		};

		const validation = getEditBossListResponseSchema.safeParse(serverData);
		if (!validation.success) {
			logZodError(validation.error, { route });

			throw new Error('Invalid Boss List data');
		}

		// Success response
		return createResponse<ApiResponse<getEditBossListResponseBody>>(
			{ success: true, message: 'Boss List found.', data: serverData },
			200,
		);
	} catch (error) {
		logError(error, { route: route });
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const POST = routeGuard(handler);

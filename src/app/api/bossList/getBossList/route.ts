import { resetBossList } from '@features/boss/bossListService';
import { getBossListRequestSchema } from '@features/boss/schemas/bossList.request.schema';
import { getBossListResponseSchema } from '@features/boss/schemas/bossList.response.schema';
import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logZodError, logError, logApiFailure } from '@utils/logger';

import type { getBossListResponseBody } from '@features/boss/schemas/bossList.response.schema';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

const route = 'api/bossList/getBossList';

const handler = async (request: NextRequest, authenticatedUserId: string): Promise<NextResponse> => {
	try {
		// Validate request body using Zod
		const parseResult = getBossListRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			logZodError(parseResult.error, { route: route });

			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const { server } = parseResult.data;

		await resetBossList(authenticatedUserId);

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
								bosses: {
									select: {
										id: true,
										name: true,
										difficulty: true,
										partySize: true,
										reset: true,
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
			logApiFailure('Boss List not found', { route });

			return createResponse<ApiResponse>({ success: false, message: 'Boss List not found.' }, 200);
		}

		const serverDataRaw = bossList.servers[0];

		const characters: getBossListResponseBody['characters'] = [];

		for (const characterEntry of serverDataRaw.characters) {
			const characterData = characterEntry.character;

			if (!characterData) {
				continue;
			}

			type Boss = getBossListResponseBody['characters'][number]['bosses'][number];

			const bosses: Boss[] = Array.from({ length: characterEntry.bosses.length });

			for (let index = 0; index < characterEntry.bosses.length; index += 1) {
				const boss = characterEntry.bosses[index];

				bosses[index] = {
					id: boss.id,
					name: boss.name,
					difficulty: boss.difficulty,
					reset: boss.reset,
					cleared: boss.cleared ?? false,
					locked: boss.locked ?? false,
					partySize: boss.partySize,
				};
			}

			characters.push({
				characterId: characterEntry.characterId,
				name: characterData.name,
				class: characterData.class,
				level: characterData.level,
				bosses,
			});
		}

		const serverData: getBossListResponseBody = {
			id: serverDataRaw.id,
			weeklyBosses: serverDataRaw.weeklyBosses,
			totalGains: serverDataRaw.totalGains,
			characters,
		};

		const validation = getBossListResponseSchema.safeParse(serverData);
		if (!validation.success) {
			logZodError(validation.error, { route });

			throw new Error('Invalid Boss List data');
		}

		// Success response
		return createResponse<ApiResponse<getBossListResponseBody>>(
			{ success: true, message: 'Boss List found.', data: serverData },
			200,
		);
	} catch (error) {
		logError(error, { route: route });
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const POST = routeGuard(handler);

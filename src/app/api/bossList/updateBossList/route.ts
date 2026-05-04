import { updateBossListRequestSchema } from '@features/boss/schemas/bossList.request.schema';
import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logZodError, logApiFailure, logError } from '@utils/logger';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

const route = 'api/bossList/updateBossList';

const handler = async (request: NextRequest, authenticatedUserId: string): Promise<NextResponse> => {
	try {
		// Validate request body using Zod
		const parseResult = updateBossListRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			logZodError(parseResult.error, { route: route });

			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const data = parseResult.data;

		const existingBossList = await prisma.bossList.findUnique({
			where: { userId: authenticatedUserId },
			select: {
				id: true,
				servers: { select: { id: true, serverName: true, characters: { select: { id: true, characterId: true } } } },
			},
		});
		if (!existingBossList) {
			logApiFailure('Boss List not found', { route });

			return createResponse<ApiResponse>({ success: false, message: 'Boss list not found' }, 404);
		}

		const targetServer = existingBossList.servers.find((server): boolean => server.id === data.id);
		if (!targetServer) {
			logApiFailure('Server not found', { route });

			return createResponse<ApiResponse>({ success: false, message: 'Server not found' }, 404);
		}

		await prisma.$transaction(async (tx) => {
			for (const incomingCharacter of data.characters) {
				const existingCharacter = targetServer.characters.find(
					(character): boolean => character.characterId === incomingCharacter.characterId,
				);
				if (!existingCharacter) {
					continue;
				}

				await tx.bossCharacter.update({
					where: { id: existingCharacter.id },
					data: { totalIncome: incomingCharacter.totalIncome },
				});

				const existingBosses = await tx.boss.findMany({
					where: { characterId: existingCharacter.id },
					select: { id: true, name: true, difficulty: true, reset: true, dailyTotal: true },
				});

				const incomingBosses = incomingCharacter.bosses;

				const bossKey = (boss: { name: string; difficulty: string }): string => `${boss.name}-${boss.difficulty}`;

				const existingMap = new Map(existingBosses.map((boss): [string, typeof boss] => [bossKey(boss), boss]));
				const incomingMap = new Map(incomingBosses.map((boss): [string, typeof boss] => [bossKey(boss), boss]));

				const bossesToDelete = existingBosses.filter((boss): boolean => !incomingMap.has(bossKey(boss)));
				const bossesToCreate = incomingBosses.filter((boss): boolean => !existingMap.has(bossKey(boss)));

				const bossesToUpdate = incomingBosses.filter((boss): boolean => {
					const existing = existingMap.get(bossKey(boss));
					if (!existing) {
						return false;
					}

					return existing.reset !== boss.reset || existing.dailyTotal !== boss.dailyTotal;
				});

				if (bossesToDelete.length > 0) {
					await tx.boss.deleteMany({ where: { id: { in: bossesToDelete.map((boss) => boss.id) } } });
				}

				if (bossesToCreate.length > 0) {
					await tx.boss.createMany({
						data: bossesToCreate.map((boss) => ({
							name: boss.name,
							difficulty: boss.difficulty,
							reset: boss.reset,
							dailyTotal: boss.dailyTotal,
							characterId: existingCharacter.id,
						})),
					});
				}

				for (const boss of bossesToUpdate) {
					const existing = existingMap.get(bossKey(boss));
					if (!existing) {
						continue;
					}

					await tx.boss.update({
						where: { id: existing.id },
						data: { reset: boss.reset, dailyTotal: boss.dailyTotal },
					});
				}
			}
		});

		// Success response
		return createResponse<ApiResponse>({ success: true, message: 'Boss list updated successfully' }, 200);
	} catch (error) {
		logError(error, { route: route });

		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const POST = routeGuard(handler);

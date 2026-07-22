import { updateBossListRequestSchema } from '@features/boss/schemas/bossList.request.schema';
import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logZodError, logApiFailure, logError } from '@utils/logger';

import type { Prisma, BossReset } from '@prisma/client';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

const getBossKey = (boss: { name: string; difficulty: string }): string => `${boss.name}-${boss.difficulty}`;

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
				servers: {
					select: { id: true, serverName: true, characters: { select: { id: true, characterId: true } } },
				},
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

		const existingCharacterMap = new Map(
			targetServer.characters.map((character): [string, typeof character] => [character.characterId, character]),
		);

		await prisma.$transaction(async (tx) => {
			const transactionPromises: Promise<unknown>[] = [];

			for (const incomingCharacter of data.characters) {
				const existingCharacter = existingCharacterMap.get(incomingCharacter.characterId);

				if (!existingCharacter) {
					continue;
				}

				transactionPromises.push(
					tx.bossCharacter.update({
						where: { id: existingCharacter.id },
						data: { totalIncome: incomingCharacter.totalIncome },
					}),
				);

				const existingBosses = await tx.boss.findMany({
					where: { characterId: existingCharacter.id },
					select: { id: true, name: true, difficulty: true, reset: true, dailyTotal: true, partySize: true },
				});

				const existingBossMap = new Map(
					existingBosses.map((boss): [string, typeof boss] => [getBossKey(boss), boss]),
				);

				const incomingBossMap = new Map(
					incomingCharacter.bosses.map((boss): [string, typeof boss] => [getBossKey(boss), boss]),
				);

				const bossIdsToDelete: string[] = [];
				const bossesToCreate: Prisma.BossCreateManyInput[] = [];

				const bossesToUpdate: { id: string; reset: BossReset; dailyTotal: number; partySize: number }[] = [];

				for (const existingBoss of existingBosses) {
					const bossKey = getBossKey(existingBoss);

					if (!incomingBossMap.has(bossKey)) {
						bossIdsToDelete.push(existingBoss.id);
					}
				}

				for (const incomingBoss of incomingCharacter.bosses) {
					const bossKey = getBossKey(incomingBoss);

					const existingBoss = existingBossMap.get(bossKey);

					if (!existingBoss) {
						bossesToCreate.push({
							name: incomingBoss.name,
							difficulty: incomingBoss.difficulty,
							reset: incomingBoss.reset,
							dailyTotal: incomingBoss.dailyTotal,
							partySize: incomingBoss.partySize,
							characterId: existingCharacter.id,
						});

						continue;
					}

					const hasChanged =
						existingBoss.reset !== incomingBoss.reset ||
						existingBoss.dailyTotal !== incomingBoss.dailyTotal ||
						existingBoss.partySize !== incomingBoss.partySize;

					if (!hasChanged) {
						continue;
					}

					bossesToUpdate.push({
						id: existingBoss.id,
						reset: incomingBoss.reset,
						dailyTotal: incomingBoss.dailyTotal,
						partySize: incomingBoss.partySize,
					});
				}

				if (bossIdsToDelete.length > 0) {
					transactionPromises.push(tx.boss.deleteMany({ where: { id: { in: bossIdsToDelete } } }));
				}

				if (bossesToCreate.length > 0) {
					transactionPromises.push(tx.boss.createMany({ data: bossesToCreate }));
				}

				for (const bossToUpdate of bossesToUpdate) {
					transactionPromises.push(
						tx.boss.update({
							where: { id: bossToUpdate.id },
							data: {
								reset: bossToUpdate.reset,
								dailyTotal: bossToUpdate.dailyTotal,
								partySize: bossToUpdate.partySize,
							},
						}),
					);
				}
			}

			if (transactionPromises.length > 0) {
				await Promise.all(transactionPromises);
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

import { updateBossListRequestSchema } from '@features/boss/schemas/bossList.request.schema';
import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logZodError, logApiFailure, logError } from '@utils/logger';

import type { Prisma } from '@generated/prisma/client';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

const getBossKey = (boss: { name: string; difficulty: string }): string => `${boss.name}-${boss.difficulty}`;

const route = 'api/bossList/updateBossList';

const handler = async (request: NextRequest, authenticatedUserId: string): Promise<NextResponse> => {
	try {
		const parseResult = updateBossListRequestSchema.safeParse(await request.json());

		if (!parseResult.success) {
			logZodError(parseResult.error, { route });

			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const data = parseResult.data;

		const existingBossList = await prisma.bossList.findUnique({
			where: { userId: authenticatedUserId },
			select: {
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
			targetServer.characters.map((bossCharacter): [string, typeof bossCharacter] => [
				bossCharacter.characterId,
				bossCharacter,
			]),
		);

		await prisma.$transaction(async (tx) => {
			const transactionPromises: Promise<unknown>[] = [];

			for (const incomingCharacter of data.characters) {
				const existingBossCharacter = existingCharacterMap.get(incomingCharacter.characterId);
				if (!existingBossCharacter) {
					continue;
				}

				const existingBosses = await tx.boss.findMany({
					where: { bossCharacterId: existingBossCharacter.id },
					select: {
						id: true,
						name: true,
						difficulty: true,
						reset: true,
						dailyTotal: true,
						dailyCleared: true,
						locked: true,
						partySize: true,
					},
				});

				const existingBossMap = new Map(
					existingBosses.map((boss): [string, typeof boss] => [getBossKey(boss), boss]),
				);

				const incomingBossMap = new Map(
					incomingCharacter.bosses.map((boss): [string, typeof boss] => [getBossKey(boss), boss]),
				);

				const bossIdsToDelete: string[] = [];
				const bossesToCreate: Prisma.BossCreateManyInput[] = [];
				const bossesToUpdate: { id: string; data: Prisma.BossUpdateInput }[] = [];

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
							bossCharacterId: existingBossCharacter.id,
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

					const newLocked =
						incomingBoss.dailyTotal === null ||
						incomingBoss.dailyTotal === undefined ||
						existingBoss.dailyCleared === null ||
						existingBoss.dailyCleared === undefined
							? (existingBoss.locked ?? false)
							: incomingBoss.dailyTotal <= existingBoss.dailyCleared;

					bossesToUpdate.push({
						id: existingBoss.id,
						data: {
							reset: incomingBoss.reset,
							dailyTotal: incomingBoss.dailyTotal,
							dailyCleared: incomingBoss.dailyCleared,
							locked: newLocked,
							partySize: incomingBoss.partySize,
						},
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
						tx.boss.update({ where: { id: bossToUpdate.id }, data: bossToUpdate.data }),
					);
				}
			}

			await Promise.all(transactionPromises);
		});

		return createResponse<ApiResponse>({ success: true, message: 'Boss list updated successfully' }, 200);
	} catch (error) {
		logError(error, { route });

		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const POST = routeGuard(handler);

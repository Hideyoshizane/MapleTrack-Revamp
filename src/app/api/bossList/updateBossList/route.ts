import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { getToken } from 'next-auth/jwt';

import { UpdateBossListRequestSchema } from '@features/Boss/bossListSchema';
import { prisma } from '@lib/prisma';
import { createResponse } from '@utils/createResponse';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

dayjs.extend(utc);

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
		const parseResult = UpdateBossListRequestSchema.safeParse(body);
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const data = parseResult.data.data;

		const existingBossList = await prisma.bossList.findUnique({
			where: { userId: authenticatedUserId },
			include: {
				servers: {
					include: {
						characters: true,
					},
				},
			},
		});
		if (!existingBossList) {
			return createResponse<ApiResponse>({ success: false, message: 'Boss list not found' }, 404);
		}

		const targetServer = existingBossList.servers.find((server): boolean => server.name === data.name);
		if (!targetServer) {
			return createResponse<ApiResponse>({ success: false, message: 'Server not found' }, 404);
		}
		const existingCharactersMap = new Map(targetServer.characters.map((character) => [character.name, character]));
		for (const incomingCharacter of data.characters) {
			const existingCharacter = existingCharactersMap.get(incomingCharacter.name);

			if (!existingCharacter) {
				continue;
			}

			const hasInvalidChange =
				existingCharacter.code !== incomingCharacter.code ||
				existingCharacter.class !== incomingCharacter.class ||
				existingCharacter.level !== incomingCharacter.level;

			if (hasInvalidChange) {
				return createResponse<ApiResponse>({ success: false, message: `Invalid update Request` }, 400);
			}
		}

		await prisma.$transaction(async (tx) => {
			for (const incomingCharacter of data.characters) {
				const existingCharacter = targetServer.characters.find(
					(character) => character.name === incomingCharacter.name,
				);

				if (!existingCharacter) {
					continue;
				}

				await tx.bossCharacter.update({
					where: { id: existingCharacter.id },
					data: {
						totalIncome: incomingCharacter.totalIncome,
					},
				});

				await tx.boss.deleteMany({
					where: { characterId: existingCharacter.id },
				});

				if (incomingCharacter.bosses.length > 0) {
					await tx.boss.createMany({
						data: incomingCharacter.bosses.map((boss) => ({
							name: boss.name,
							difficulty: boss.difficulty,
							reset: boss.reset,
							cleared: boss.cleared,
							date: boss.date,
							dailyTotal: boss.dailyTotal,
							locked: boss.locked,
							characterId: existingCharacter.id,
						})),
					});
				}
			}

			await tx.bossServer.update({
				where: { id: targetServer.id },
				data: {
					weeklyBosses: data.weeklyBosses,
					totalGains: data.totalGains,
				},
			});

			await tx.bossList.update({
				where: { id: existingBossList.id },
				data: {
					lastUpdate: dayjs().utc().toDate(),
				},
			});
		});

		// Success response
		return createResponse<ApiResponse>({ success: true, message: 'Boss list updated successfully' }, 200);
	} catch (error) {
		console.error('boss_list_fetch_failed', { error: error instanceof Error ? error.message : 'unknown' });

		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

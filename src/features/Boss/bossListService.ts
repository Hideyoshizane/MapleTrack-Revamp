import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { prisma } from '@lib/prisma';
import { hasDailyResetOccurred, hasWeeklyResetOccurred, hasMonthlyResetOccurred } from '@utils/time';

import type { PrismaClient } from '@prisma/client';

dayjs.extend(utc);

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

// Creates a BossList object ready to be stored in the database.
export const createBossList = async (tx: TransactionClient, authenticatedUserId: string): Promise<void> => {
	try {
		await tx.bossList.create({
			data: { userId: authenticatedUserId, lastUpdate: new Date() },
		});
	} catch (error) {
		console.error('Error creating BossList:', error);
		throw error;
	}
};

// Adds a server to the given BossList, or creates a new BossList if none exists.
const addServerToBossList = async (
	tx: TransactionClient,
	authenticatedUserId: string,
	serverName: string,
): Promise<string | null> => {
	try {
		// Return early if server already exists
		const bossList = await tx.bossList.findUnique({
			where: { userId: authenticatedUserId },
			select: { id: true },
		});

		if (!bossList) {
			throw new Error('BossList not found for user.');
		}

		let server = await tx.bossServer.findFirst({
			where: { bossListId: bossList.id, serverName },
			select: { id: true },
		});

		if (!server) {
			server = await tx.bossServer.create({
				data: { serverName, weeklyBosses: 0, totalGains: 0, bossList: { connect: { id: bossList.id } } },
				select: { id: true },
			});
		}

		return server.id;
	} catch (error) {
		console.error('Error adding server to BossList:', error);
		throw error;
	}
};

export const characterToBossList = async (
	tx: TransactionClient,
	authenticatedUserId: string,
	serverName: string,
	characterId: string,
	isBossCharacter: boolean,
): Promise<void> => {
	// Ensure server exists and get its id
	const serverId = await addServerToBossList(tx, authenticatedUserId, serverName);
	if (!serverId) {
		throw new Error('BossList not found for user.');
	}

	if (!isBossCharacter) {
		await tx.bossCharacter.deleteMany({
			where: { characterId, serverId },
		});
		return;
	}

	await tx.bossCharacter.upsert({
		where: { serverId_characterId: { serverId, characterId } },
		update: {},
		create: { characterId, serverId, totalIncome: 0 },
	});
};

type resetBossListRequestBody = {
	serverName: string;
	authenticatedUserId: string;
};

export const resetBossList = async (serverData: resetBossListRequestBody): Promise<void> => {
	// Query BossList and return only the requested server
	const bossList = await prisma.bossList.findUnique({
		where: { userId: serverData.authenticatedUserId },
		select: {
			id: true,
			lastUpdate: true,
			servers: {
				where: { serverName: serverData.serverName },
				select: {
					id: true,
					weeklyBosses: true,
					totalGains: true,
					characters: {
						select: { characterId: true, bosses: { select: { id: true, reset: true, cleared: true, locked: true } } },
					},
				},
			},
		},
	});

	if (!bossList) {
		return;
	}

	const isDailyReset = hasDailyResetOccurred(bossList.lastUpdate);
	const isWeeklyReset = hasWeeklyResetOccurred(bossList.lastUpdate);
	const isMonthlyReset = hasMonthlyResetOccurred(bossList.lastUpdate);

	if (!isDailyReset && !isWeeklyReset && !isMonthlyReset) {
		return;
	}

	const server = bossList.servers[0];
	if (!server) {
		return;
	}

	const serverUpdate: { weeklyBosses?: number; totalGains?: number } = {};

	if (isWeeklyReset) {
		serverUpdate.weeklyBosses = 0;
		serverUpdate.totalGains = 0;
	}
	await prisma.$transaction(async (tx) => {
		for (const character of server.characters) {
			const updatedBosses = character.bosses.map((boss) => {
				const nextState = { id: boss.id, cleared: boss.cleared, locked: boss.locked };

				if (isDailyReset && boss.reset === 'Daily') {
					nextState.cleared = false;
				}

				if (isWeeklyReset && boss.reset === 'Weekly') {
					nextState.cleared = false;
				}

				if (boss.reset === 'Monthly') {
					if (isWeeklyReset) {
						nextState.cleared = false;
						nextState.locked = true;
					}

					if (isMonthlyReset) {
						nextState.locked = false;
					}
				}

				return nextState;
			});

			for (const boss of updatedBosses) {
				await tx.boss.updateMany({
					where: { id: boss.id },
					data: { cleared: boss.cleared, locked: boss.locked },
				});
			}
		}

		await tx.bossServer.update({
			where: { id: server.id },
			data: serverUpdate,
		});
	});

	await prisma.bossList.update({
		where: { userId: serverData.authenticatedUserId },
		data: { lastUpdate: new Date() },
	});
};

import { prisma } from '@lib/prisma';
import { hasDailyResetOccurred, hasWeeklyResetOccurred, hasMonthlyResetOccurred, nowInUtc } from '@utils/time';

import type { PrismaClient } from '@generated/prisma/client';

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

// Creates a BossList object ready to be stored in the database.
export const createBossList = async (tx: TransactionClient, authenticatedUserId: string): Promise<void> => {
	try {
		await tx.bossList.create({
			data: {
				userId: authenticatedUserId,
				lastUpdateDaily: nowInUtc(),
				lastUpdateWeekly: nowInUtc(),
				lastUpdateMonthly: nowInUtc(),
			},
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
		const bossList = await tx.bossList.findUnique({ where: { userId: authenticatedUserId }, select: { id: true } });
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
		await tx.bossCharacter.deleteMany({ where: { characterId, serverId } });

		await tx.liberation.deleteMany({ where: { characterId, userId: authenticatedUserId } });

		return;
	}

	await tx.bossCharacter.upsert({
		where: { serverId_characterId: { serverId, characterId } },
		update: {},
		create: { characterId, serverId },
	});

	await tx.liberation.upsert({
		where: { userId_characterId: { userId: authenticatedUserId, characterId } },
		update: {},
		create: {
			userId: authenticatedUserId,
			characterId: characterId,
			server: serverName,
			currentGenesisQuest: 'Von Leon',
			currentGenesisPoints: 0,
			genesisPass: false,
			liberated: false,
			currentDestinyQuest: 'Seren',
			currentDestinyPoints: 0,
			currentAstraQuest: 'First',
			currentAstraVestigesPoints: 0,
			currentAstraTracesPoints: 0,
		},
	});

	await tx.user.update({ where: { id: authenticatedUserId }, data: { liberationLastUpdate: nowInUtc() } });
};

type ResetFlags = { daily: boolean; weekly: boolean; monthly: boolean };

type BossResetState = { cleared: boolean; locked: boolean; dailyCleared: number };

type BossResetData = {
	id: string;
	reset: string;
	cleared: boolean | null;
	dailyCleared: number | null;
	dailyTotal: number | null;
	locked: boolean | null;
};

const getNextBossResetState = (boss: BossResetData, resets: ResetFlags): BossResetState => {
	let cleared = boss.cleared ?? false;
	let locked = boss.locked ?? false;
	let dailyCleared = boss.dailyCleared ?? 0;

	if (boss.reset === 'Daily') {
		if (resets.daily) {
			cleared = false;
			locked = dailyCleared >= (boss.dailyTotal ?? 0);
		}

		if (resets.weekly) {
			dailyCleared = 0;
			locked = false;
		}
	}

	if (boss.reset === 'Weekly' && resets.weekly) {
		cleared = false;
	}

	if (boss.reset === 'Monthly') {
		if (resets.weekly) {
			cleared = false;
			locked = true;
		}

		if (resets.monthly) {
			locked = false;
		}
	}

	return { cleared, locked, dailyCleared };
};

export const resetBossList = async (authenticatedUserId: string): Promise<void> => {
	// Fetch only reset timestamps.
	const resetTimestamps = await prisma.bossList.findUnique({
		where: { userId: authenticatedUserId },
		select: { id: true, lastUpdateDaily: true, lastUpdateWeekly: true, lastUpdateMonthly: true },
	});
	if (!resetTimestamps) {
		return;
	}

	const resets: ResetFlags = {
		daily: hasDailyResetOccurred(resetTimestamps.lastUpdateDaily),
		weekly: hasWeeklyResetOccurred(resetTimestamps.lastUpdateWeekly),
		monthly: hasMonthlyResetOccurred(resetTimestamps.lastUpdateMonthly),
	};
	if (!resets.daily && !resets.weekly && !resets.monthly) {
		return;
	}

	// Fetch boss data only when a reset is necessary.
	const bossList = await prisma.bossList.findUnique({
		where: { id: resetTimestamps.id },
		select: {
			servers: {
				select: {
					id: true,
					characters: {
						select: {
							bosses: {
								select: {
									id: true,
									reset: true,
									cleared: true,
									dailyCleared: true,
									dailyTotal: true,
									locked: true,
								},
							},
						},
					},
				},
			},
		},
	});
	if (!bossList) {
		return;
	}

	// Apply the required changes transactionally.
	await prisma.$transaction(async (tx) => {
		const bossUpdates: Promise<unknown>[] = [];
		const serverUpdates: Promise<unknown>[] = [];

		for (const server of bossList.servers) {
			for (const character of server.characters) {
				for (const boss of character.bosses) {
					const next = getNextBossResetState(boss, resets);

					if (resets.monthly && boss.reset === 'Monthly') {
						next.cleared = false;
						next.locked = false;
					}

					const changed =
						next.cleared !== (boss.cleared ?? false) ||
						next.locked !== (boss.locked ?? false) ||
						next.dailyCleared !== (boss.dailyCleared ?? 0);
					if (!changed) {
						continue;
					}

					bossUpdates.push(tx.boss.update({ where: { id: boss.id }, data: next }));
				}
			}

			if (resets.weekly) {
				serverUpdates.push(
					tx.bossServer.update({ where: { id: server.id }, data: { weeklyBosses: 0, totalGains: 0 } }),
				);
			}
		}

		await Promise.all([...bossUpdates, ...serverUpdates]);

		const now = nowInUtc();

		await tx.bossList.update({
			where: { id: resetTimestamps.id },
			data: {
				...(resets.daily && { lastUpdateDaily: now }),
				...(resets.weekly && { lastUpdateWeekly: now }),
				...(resets.monthly && { lastUpdateMonthly: now }),
			},
		});
	});
};

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

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

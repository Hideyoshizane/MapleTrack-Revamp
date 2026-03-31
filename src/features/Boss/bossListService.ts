import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { prisma } from '@lib/prisma';

import type { Prisma } from '@prisma/client';

dayjs.extend(utc);

// Creates a BossList object ready to be stored in the database.
export const createBossList = async (tx: Prisma.TransactionClient, authenticatedUserId: string): Promise<void> => {
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
const addServerToBossList = async (authenticatedUserId: string, serverName: string): Promise<string | null> => {
	try {
		// Return early if server already exists
		const bossList = await prisma.bossList.findUnique({
			where: { userId: authenticatedUserId },
			select: {
				id: true,
				servers: { select: { id: true, name: true } },
			},
		});

		if (!bossList) {
			throw new Error('BossList not found for user.');
		}

		const existingServer = bossList.servers.find((server): boolean => server.name === serverName);
		if (existingServer) {
			return existingServer.id;
		}

		const createdServer = await prisma.bossServer.create({
			data: {
				name: serverName,
				weeklyBosses: 0,
				totalGains: 0,
				bossList: { connect: { id: bossList.id } },
			},
			select: { id: true },
		});

		return createdServer.id;
	} catch (error) {
		console.error('Error adding server to BossList:', error);
		throw error;
	}
};

export const characterToBossList = async (
	authenticatedUserId: string,
	serverName: string,
	characterName: string,
	code: string,
	charClass: string,
	level: number,
	isBossCharacter: boolean,
): Promise<void> => {
	// Ensure server exists and get its id
	const serverId = await addServerToBossList(authenticatedUserId, serverName);
	if (!serverId) {
		throw new Error('BossList not found for user.');
	}

	const existingCharacter = await prisma.bossCharacter.findFirst({
		where: { code, serverId },
		select: { id: true },
	});

	// Remove Character flow
	if (!isBossCharacter) {
		if (!existingCharacter) {
			return;
		}

		await prisma.bossCharacter.delete({
			where: { id: existingCharacter.id },
		});

		return;
	}

	// Add Character flow
	if (existingCharacter) {
		await prisma.bossCharacter.update({
			where: { id: existingCharacter.id },
			data: { name: characterName, level, class: charClass },
		});

		return;
	}

	await prisma.bossCharacter.create({
		data: {
			name: characterName,
			code,
			class: charClass,
			level,
			totalIncome: 0,
			server: { connect: { id: serverId } },
		},
	});
};

export const updateCharacterLevelFromBossList = async (
	authenticatedUserId: string,
	serverName: string,
	code: string,
	level: number,
): Promise<void> => {
	try {
		const result = await prisma.bossCharacter.updateMany({
			where: {
				code,
				server: {
					name: serverName,
					bossList: { userId: authenticatedUserId },
				},
			},
			data: { level },
		});

		if (result.count === 0) {
			return;
		}
	} catch (error) {
		console.error('Error updating character level in BossList:', error);
		throw error;
	}
};

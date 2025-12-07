import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { BossList } from '@models/bossList';

import type { BossListDocument, BossCharacter, BossServer } from '@models/bossList';

dayjs.extend(utc);

// Creates a BossList object ready to be stored in the database.
export const createBossList = async (userOrigin: string): Promise<BossListDocument> => {
	try {
		let bossList = await BossList.findOne({ userOrigin });
		if (!bossList) {
			// Create new BossList without servers
			bossList = new BossList({
				userOrigin,
				lastUpdate: new Date(),
				server: [],
			});
			await bossList.save();
		}

		return bossList;
	} catch (error) {
		console.error('Error creating BossList:', error);
		throw error;
	}
};

/**
 * Adds a server to the given BossList, or creates a new BossList if none exists.
 */
export const addServerToBossList = async (
	bossList: BossListDocument,
	serverName: string
): Promise<BossListDocument> => {
	try {
		// Return early if server already exists
		const exists = bossList.server.some((s): boolean => s.name === serverName);
		if (exists) return bossList;

		const newServer: BossServer = {
			name: serverName,
			weeklyBosses: 0,
			totalGains: 0,
			characters: [],
		};

		bossList.server.push(newServer);
		bossList.lastUpdate = dayjs.utc().toDate();

		await bossList.save();

		return bossList;
	} catch (error) {
		console.error('Error adding server to BossList:', error);
		throw error;
	}
};

export const addCharacterToBossList = async (
	userOrigin: string,
	serverName: string,
	name: string,
	code: string,
	charClass: string,
	level: number
): Promise<void> => {
	// Find existing BossList
	const bossList = await BossList.findOne({ userOrigin });
	if (!bossList) throw new Error(`BossList not found for user.`);

	// Ensure server exists
	let server = bossList.server.find((s): boolean => s.name === serverName);
	if (!server) {
		await addServerToBossList(bossList, serverName);
		server = bossList.server.find((s): boolean => s.name === serverName);
	}

	if (!server) throw new Error(`Failed to create or find server ${serverName} in BossList.`);

	// Update or insert character
	const existing = server.characters.find((c): boolean => c.code === code);
	if (existing) {
		existing.level = level;
		await bossList.save();
		return;
	}

	const newCharacter: BossCharacter = {
		name,
		code,
		class: charClass,
		level,
		totalIncome: 0,
		bosses: [],
	};

	server.characters.push(newCharacter);
	bossList.lastUpdate = dayjs.utc().toDate();

	await bossList.save();
};

// Removes a character from the BossList by user, server, and character code
export const removeCharacterFromBossList = async (
	userOrigin: string,
	serverName: string,
	code: string
): Promise<void> => {
	try {
		// Find the user's BossList containing the server
		const bossList = await BossList.findOne({ userOrigin, 'server.name': serverName });
		if (!bossList) return;

		// Locate the correct server
		const server = bossList.server.find((s): boolean => s.name === serverName);
		if (!server) return;

		// Filter out the character with the specified code
		const updatedCharacter = server.characters.filter((c): boolean => c.code !== code);

		// If no change, exit early
		if (updatedCharacter.length === server.characters.length) return;

		// Update the list and save
		server.characters = updatedCharacter;
		bossList.lastUpdate = dayjs.utc().toDate();

		await bossList.save();
	} catch (error) {
		console.error('Error removing character from BossList:', error);
		throw error;
	}
};

// Removes a character from the BossList by user, server, and character code
export const updateCharacterLevelFromBossList = async (
	userOrigin: string,
	serverName: string,
	code: string,
	level: number
): Promise<void> => {
	try {
		// Find the user's BossList containing the server
		const bossList = await BossList.findOne({ userOrigin, 'server.name': serverName });
		if (!bossList) return;

		// Locate the correct server
		const server = bossList.server.find((s): boolean => s.name === serverName);
		if (!server) return;

		// Find the target character
		const character = server.characters.find((c): boolean => c.code === code);
		if (!character) return;

		// Update the level
		character.level = level;

		// Save changes
		await bossList.save();
	} catch (error) {
		console.error('Error removing character from BossList:', error);
		throw error;
	}
};

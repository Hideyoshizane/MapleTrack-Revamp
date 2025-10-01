import connectToDatabase from '@lib/mongooseConect';
import { Character } from '@models/character';
import { createResponse } from '@utils/api/createResponse';
import { SERVER_OPTIONS } from '@utils/cookies/serverCookie';
import { sanitizeInputBackEnd } from '@utils/sanitize/sanitizeInputBackEnd';
import { hasDailyResetOccurred, hasWeeklyQuestResetOccurred, nowUtc } from '@utils/time/time';

import { fetchCharacterExternal } from './fetchCharacterExternal';

import type { CharacterDocument, CharacterSymbol } from '@models/character';
import type { NextResponse } from 'next/server';

export const validateUserAccess = (
	params: { userOrigin: string; server: string; code: string },
	sessionUsername: string
): boolean => {
	try {
		// Validate that the properties are strings

		if (
			typeof sessionUsername !== 'string' ||
			typeof params.userOrigin !== 'string' ||
			typeof params.server !== 'string' ||
			typeof params.code !== 'string'
		) {
			return false;
		}

		// Validate allowed server
		if (!SERVER_OPTIONS.includes(params.server)) {
			return false;
		}

		// Sanitize input
		const username = sanitizeInputBackEnd(sessionUsername);
		const userOrigin = sanitizeInputBackEnd(params.userOrigin);
		const server = sanitizeInputBackEnd(params.server);
		const code = sanitizeInputBackEnd(params.code);

		if (!username || !userOrigin || !server || !code) {
			return false;
		}

		// Ensure the session user matches the character owner
		return username === userOrigin;
	} catch (error) {
		console.error('Delete account error:', error);
		return false;
	}
};

export const syncCharacterInfo = async (params: {
	userOrigin: unknown;
	server: unknown;
	code: unknown;
}): Promise<NextResponse> => {
	try {
		await connectToDatabase();

		// Simple string type check
		if (typeof params.userOrigin !== 'string' || typeof params.server !== 'string' || typeof params.code !== 'string') {
			return createResponse({ success: false, error: 'Invalid request body' }, 400);
		}

		// Sanitize input
		const userOrigin = sanitizeInputBackEnd(params.userOrigin);
		const server = sanitizeInputBackEnd(params.server);
		const code = sanitizeInputBackEnd(params.code);

		if (!userOrigin || !server || !code) {
			return createResponse({ success: false, error: 'Missing required fields' }, 400);
		}

		// Validate allowed server
		if (!SERVER_OPTIONS.includes(server)) {
			return createResponse({ success: false, error: 'Invalid server' }, 400);
		}

		// Search for the character
		const character = await Character.findOne({ userOrigin, server, code });
		if (!character) {
			return createResponse({ success: false, error: 'Character not found' }, 404);
		}

		// Check if sync on, then sync with Maplestory API
		if (character.syncing) {
			const externalData = await fetchCharacterExternal(character.name, server);
			character.level = externalData.level;
		}

		// Reset quests
		resetDailyQuests(character);
		resetWeeklyQuests(character);

		await character.save();

		return createResponse({ success: true, message: 'Character synced successfully' }, 200);
	} catch (error) {
		console.error('Character Sync error:', error);
		return createResponse({ success: false, error: 'Internal Server Error' }, 500);
	}
};

export const resetDailyQuests = (character: CharacterDocument): void => {
	// Helper to process one symbol array
	const processSymbolArray = (symbolArray: CharacterSymbol[]): void => {
		symbolArray.forEach((symbol: CharacterSymbol): void => {
			symbol.content.forEach((quest): void => {
				// Only process daily quests that were previously interacted with
				if (quest.contentType === 'Daily Quest' && quest.date) {
					try {
						if (hasDailyResetOccurred(quest.date)) {
							quest.date = nowUtc().toDate();
						}
					} catch (error) {
						console.error(`Error checking daily reset for ${symbol.name} (${quest.contentType}):`, error);
					}
				}
			});
		});
	};

	// Run across all symbol arrays
	[character.ArcaneSymbol, character.SacredSymbol, character.GrandSacredSymbol].forEach(processSymbolArray);
};

export const resetWeeklyQuests = (character: CharacterDocument): void => {
	try {
		// All symbol arrays that could have weekly quests
		const symbolsToReset: CharacterSymbol[][] = [
			character.ArcaneSymbol,
			character.SacredSymbol,
			character.GrandSacredSymbol,
		];

		symbolsToReset.forEach((symbolArray: CharacterSymbol[]): void => {
			symbolArray.forEach((symbol: CharacterSymbol): void => {
				symbol.content.forEach((quest): void => {
					// Only process quests that have 'tries'
					if (quest.tries !== undefined) {
						if (!quest.date || hasWeeklyQuestResetOccurred(quest.date)) {
							quest.tries = quest.maxTries ?? quest.tries;
							quest.date = nowUtc().toDate();
						}
					}
				});
			});
		});
	} catch (error) {
		console.error('Error resetting weekly quests:', error);
		throw error; // propagate for higher-level handling
	}
};

import { DEFAULT_WEEKLY_TRIES } from '@data/character/constants';
import { updateCharacterLevelFromBossList } from '@features/Boss/bossListService';
import { Character } from '@features/character/characterModel';
import connectToDatabase from '@lib/mongooseConect';
import { createResponse } from '@utils/createResponse';
import { sanitizeInputBackEnd } from '@utils/sanitizeInputBackEnd';
import { SERVER_OPTIONS } from '@utils/serverCookie';
import { hasWeeklyResetOccurred, hasDailyResetOccurred } from '@utils/time';

import { fetchCharacterExternal } from './fetchCharacterExternal';

import type { CharacterDocument, CharacterSymbol } from '@features/character/characterModel';
import type { NextResponse } from 'next/server';

const sanitizeString = (input: unknown): string | null => {
	if (typeof input !== 'string') return null;
	const sanitized = sanitizeInputBackEnd(input);
	return sanitized || null;
};

export const validateUserAccess = (
	params: { userOrigin: string; server: string; code: string },
	sessionUsername: string
): boolean => {
	try {
		// Validate that the properties are strings
		const username = sanitizeString(sessionUsername);
		const userOrigin = sanitizeString(params.userOrigin);
		const server = sanitizeString(params.server);
		const code = sanitizeString(params.code);

		return (
			!!username && !!userOrigin && !!server && !!code && SERVER_OPTIONS.includes(server) && username === userOrigin
		);
	} catch (error) {
		console.error('User validation error:', error);
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

		const userOrigin = sanitizeString(params.userOrigin);
		const server = sanitizeString(params.server);
		const code = sanitizeString(params.code);

		if (!userOrigin || !server || !code || !SERVER_OPTIONS.includes(server)) {
			return createResponse({ success: false, error: 'Invalid request' }, 400);
		}

		// Search for the character
		const character = await Character.findOne({ userOrigin, server, code });
		if (!character) {
			return createResponse({ success: false, error: 'Character not found' }, 404);
		}

		// Check if sync on, then sync with Maplestory API
		if (character.syncing) {
			const externalData = await fetchCharacterExternal(character.name, server);

			// Only update when external level is higher
			if (externalData.level > character.level) {
				character.level = externalData.level;

				// Change on the BossList
				await updateCharacterLevelFromBossList(userOrigin, server, code, externalData.level);
			}
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

const resetDailyQuests = (character: CharacterDocument): void => {
	// Helper to process one symbol array
	const processSymbolArray = (symbolArray: CharacterSymbol[]): void => {
		symbolArray.forEach((symbol: CharacterSymbol): void => {
			symbol.content.forEach((quest): void => {
				// Only process daily quests that were previously interacted with
				if (quest.contentType === 'Daily Quest' && quest.date) {
					try {
						if (hasDailyResetOccurred(quest.date)) {
							quest.cleared = false;
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

const resetWeeklyQuests = (character: CharacterDocument): void => {
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
						if (!quest.date || hasWeeklyResetOccurred(quest.date)) {
							quest.tries = DEFAULT_WEEKLY_TRIES ?? quest.tries;
							quest.cleared = false;
						}
					}
				});
			});
		});
	} catch (error) {
		console.error('Error resetting weekly quests:', error);
		throw error;
	}
};

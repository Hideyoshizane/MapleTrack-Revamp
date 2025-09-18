import connectToDatabase from '@lib/mongooseConect';
import { Character, CharacterDocument, Symbol } from '@models/character';
import { createResponse } from '@utils/api/createResponse';
import { SERVER_OPTIONS } from '@utils/cookies/serverCookie';
import { isString } from '@utils/guards/isString';
import { sanitizeInputBackEnd } from '@utils/sanitize/sanitizeInputBackEnd';
import { hasDailyResetOccurred, hasWeeklyQuestResetOccurred } from '@utils/time/time';

export function validadeUserAcess(
	params: {
		userOrigin: string;
		server: string;
		code: string;
	},
	sessionUsername: string
) {
	try {
		// Validate that the properties are strings
		if (
			!isString(sessionUsername) ||
			!isString(params.userOrigin) ||
			!isString(params.server) ||
			!isString(params.code)
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

		if (username !== userOrigin) {
			return false;
		}

		return true;
	} catch (error) {
		console.error('Delete account error:', error);
		return false;
	}
}

export async function syncCharacterInfo(params: { userOrigin: string; server: string; code: string }) {
	try {
		await connectToDatabase();

		// Validate that the properties are strings
		if (!isString(params.userOrigin) || !isString(params.server) || !isString(params.code)) {
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
		const character = await Character.findOne({
			userOrigin: userOrigin,
			server: server,
			code: code,
		});
		// Check if character exists
		if (!character) {
			return createResponse({ success: false, error: 'Character not found' }, 404);
		}

		// Check if sync on, then sync with Maplestory API
		if (character.syncing) {
			const baseUrl = process.env.NEXT_PUBLIC_BASE_URLxx || 'http://localhost:3000';
			const res = await fetch(
				`${baseUrl}/api/characters/getAPICharacterImage?character_name=${character.name}&server=${server}`,
				{ cache: 'no-store' }
			);

			if (!res.ok) {
				return createResponse(
					{
						success: false,
						message: 'Failed to fetch external character',
					},
					200
				);
			}
		}

		// Sync Daily
		resetDailyQuests(character);

		// Sync Weekly
		resetWeeklyQuests(character);

		await character.save();
	} catch (error) {
		console.error('Delete account error:', error);
		return createResponse({ success: false, error: 'Internal Server Error' }, 500);
	}
}

export const resetDailyQuests = (character: CharacterDocument): void => {
	// Helper function to process symbol arrays
	const processSymbolArray = (symbolArray: Symbol[]): void => {
		for (const symbol of symbolArray) {
			for (const quest of symbol.content) {
				// Only process Daily Quests that have a date
				if (quest.contentType === 'Daily Quest' && quest.date) {
					try {
						if (hasDailyResetOccurred(quest.date)) {
							quest.date = null; // reset the date
						}
					} catch (error) {
						console.error(`Error checking daily reset for ${symbol.name} (${quest.contentType}):`, error);
					}
				}
			}
		}
	};

	processSymbolArray(character.ArcaneSymbol);
	processSymbolArray(character.SacredSymbol);
	processSymbolArray(character.GrandSacredSymbol);
};

export const resetWeeklyQuests = (character: CharacterDocument): void => {
	// Only ArcaneSymbol has content with 'tries'
	const arcaneSymbols: Symbol[] = character.ArcaneSymbol;

	for (const symbol of arcaneSymbols) {
		for (const quest of symbol.content) {
			// Only process items that have 'tries' defined
			if (quest.tries !== undefined) {
				try {
					// Only run if the date exists
					if (quest.date && hasWeeklyQuestResetOccurred(quest.date)) {
						quest.tries = quest.maxTries ?? quest.tries;
					}
				} catch (error) {
					console.error(`Error checking weekly reset for ${symbol.name} (${quest.contentType}):`, error);
				}
			}
		}
	}
};

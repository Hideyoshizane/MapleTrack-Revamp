import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import {
	getContentValue,
	calculateNewLevelFromExp,
	canUseSymbol,
	getSymbolMaxLevel,
} from '@data/symbols/symbolMappings';
import connectToDatabase from '@lib/mongooseConect';
import { Character } from '@models/character';
import { updateAllDailySchema } from '@schemas/characterUpdateSchema';
import { createResponse } from '@utils/api/createResponse';
import { SERVER_OPTIONS } from '@utils/cookies/serverCookie';
import { sanitizeInputBackEnd } from '@utils/sanitize/sanitizeInputBackEnd';

import type { LevelUpResult } from '@data/symbols/symbolMappings';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

dayjs.extend(utc);

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		await connectToDatabase();
		// Validate request body using Zod
		const parseResult = updateAllDailySchema.safeParse(await request.json());
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, error: 'Invalid request body' }, 400);
		}
		const { userOrigin: rawUsername, server: rawServer, code: rawCode } = parseResult.data;

		// Sanitize
		const [username, server, code] = [rawUsername, rawServer, rawCode].map(sanitizeInputBackEnd);
		if (!username || !server || !code) {
			return createResponse<ApiResponse>({ success: false, error: 'Missing required fields' }, 400);
		}

		// Validate allowed server
		if (!SERVER_OPTIONS.includes(server)) {
			return createResponse<ApiResponse>({ success: false, error: 'Invalid server' }, 400);
		}

		// Search for the character
		const character = await Character.findOne({ userOrigin: username, server, code }).exec();
		if (!character) {
			return createResponse<ApiResponse>({ success: true, message: 'Character not found.' }, 200);
		}

		const updatedResults: Record<string, LevelUpResult> = {};

		// Helper to process symbol array
		const processSymbols = (symbols: typeof character.ArcaneSymbol, bonus: number): void => {
			for (const symbol of symbols) {
				// Check if character level > symbol.minlevel so it is enabled.
				const usable = canUseSymbol(character.level, symbol.name);
				if (!usable) continue;

				// Check if symbol is already maxed.
				const symbolMaxLevel = getSymbolMaxLevel(symbol.category);
				if (symbol.level >= symbolMaxLevel) continue;

				// Check if daily is already cleared.
				const mainContent = symbol.content[0];
				if (mainContent?.cleared) continue;

				// If not checked, jump.
				if (!mainContent.checked) continue;

				let dailyValue = getContentValue(symbol.name, 'Daily Quest');

				// Check if bonus content type is active
				if (symbol.content[2]?.checked) {
					dailyValue += getContentValue(symbol.content[2].contentType, 'Daily Quest');
				}

				// Add global bonus
				dailyValue += bonus;

				// Update exp and level
				symbol.exp += dailyValue;
				const newValues = calculateNewLevelFromExp(symbol.category, symbol.level, symbol.exp);
				symbol.level = newValues.currentLevel;
				symbol.exp = newValues.currentExp;

				mainContent.cleared = true;
				mainContent.date = dayjs().utc().toDate();

				updatedResults[symbol.name] = newValues;
			}
		};
		const arcaneBonus = parseResult.data.arcaneBonus;
		const sacredBonus = parseResult.data.sacredBonus;
		// Process each symbol category
		processSymbols(character.ArcaneSymbol, arcaneBonus ?? 0);
		processSymbols(character.SacredSymbol, sacredBonus ?? 0);
		processSymbols(character.GrandSacredSymbol, sacredBonus ?? 0);

		await character.save();

		// Return value
		return createResponse<ApiResponse<Record<string, LevelUpResult>>>(
			{
				success: true,
				message: 'Character updated successfully.',
				data: updatedResults,
			},
			200
		);
	} catch (error) {
		console.error('Search error:', error);
		return createResponse<ApiResponse>({ success: false, error: 'Internal Server Error' }, 500);
	}
};

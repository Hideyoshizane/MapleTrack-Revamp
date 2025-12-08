import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { getContentValue, calculateNewLevelFromExp } from '@data/symbols/symbolMappings';
import { Character } from '@features/character/characterModel';
import { updateCharacterDailySchema } from '@features/character/characterUpdateSchema';
import connectToDatabase from '@lib/mongooseConect';
import { createResponse } from '@utils/createResponse';
import { sanitizeInputBackEnd } from '@utils/sanitizeInputBackEnd';
import { SERVER_OPTIONS } from '@utils/serverCookie';

import type { LevelUpResult } from '@data/symbols/symbolMappings';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

dayjs.extend(utc);

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		await connectToDatabase();
		// Validate request body using Zod
		const parseResult = updateCharacterDailySchema.safeParse(await request.json());
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}
		const {
			symbolName: rawSymbolName,
			bonus,
			userOrigin: rawUsername,
			server: rawServer,
			code: rawCode,
		} = parseResult.data;

		const [symbolName, username, server, code] = [rawSymbolName, rawUsername, rawServer, rawCode].map(
			sanitizeInputBackEnd
		);
		if (!symbolName || !username || !server || !code) {
			return createResponse<ApiResponse>({ success: false, message: 'Missing required fields' }, 400);
		}

		// Validate allowed server
		if (!SERVER_OPTIONS.includes(server)) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid server' }, 400);
		}

		// Search for the character
		const character = await Character.findOne({ userOrigin: username, server, code }).exec();
		if (!character) {
			return createResponse<ApiResponse>({ success: true, message: 'Character not found.' }, 200);
		}

		// Find character Symbol
		const allSymbols = [...character.ArcaneSymbol, ...character.SacredSymbol, ...character.GrandSacredSymbol];
		const symbol = allSymbols.find((s): boolean => s.name === symbolName);
		if (!symbol) {
			return createResponse<ApiResponse>({ success: false, message: 'Symbol not found on character' }, 404);
		}
		if (symbol.content[0].cleared == true) {
			return createResponse<ApiResponse>({ success: false, message: 'Daily already cleared.' }, 404);
		}

		// Find Symbol daily Value
		let dailyValue = getContentValue(symbolName, 'Daily Quest');
		if (symbol.content[2]?.checked == true) {
			dailyValue += getContentValue(symbol.content[2].contentType, 'Daily Quest');
		}
		// Sum with bonus value
		dailyValue += bonus;

		// Update symbol exp and level
		symbol.exp += dailyValue;
		const newValues = calculateNewLevelFromExp(symbol.category, symbol.level, symbol.exp);
		symbol.level = newValues.currentLevel;
		symbol.exp = newValues.currentExp;

		symbol.content[0].cleared = true;
		symbol.content[0].date = dayjs().utc().toDate();
		await character.save();

		// Return value
		return createResponse<ApiResponse<LevelUpResult>>(
			{
				success: true,
				message: 'Character updated successfully.',
				data: newValues,
			},
			200
		);
	} catch (error) {
		console.error('Search error:', error);
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

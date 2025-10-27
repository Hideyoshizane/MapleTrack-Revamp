import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { getContentValue, calculateNewLevelFromExp } from '@data/symbols/symbolMappings';
import connectToDatabase from '@lib/mongooseConect';
import { Character } from '@models/character';
import { updateCharacterWeeklySchema } from '@schemas/characterUpdateSchema';
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
		const parseResult = updateCharacterWeeklySchema.safeParse(await request.json());
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, error: 'Invalid request body' }, 400);
		}
		const { symbolName: rawSymbolName, userOrigin: rawUsername, server: rawServer, code: rawCode } = parseResult.data;

		const [symbolName, username, server, code] = [rawSymbolName, rawUsername, rawServer, rawCode].map(
			sanitizeInputBackEnd
		);
		if (!symbolName || !username || !server || !code) {
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

		// Find character Symbol
		const allSymbols = [...character.ArcaneSymbol, ...character.SacredSymbol, ...character.GrandSacredSymbol];
		const symbol = allSymbols.find((s): boolean => s.name === symbolName);
		if (!symbol) {
			return createResponse<ApiResponse>({ success: false, error: 'Symbol not found on character' }, 404);
		}

		if (symbol.content[1].cleared == true) {
			return createResponse<ApiResponse>({ success: false, error: 'Weekly already cleared.' }, 404);
		}

		// Find Symbol weekly Value
		const weeklyValue = getContentValue(symbolName, 'Weekly');

		// Update symbol exp and level
		symbol.exp += weeklyValue;
		const newValues = calculateNewLevelFromExp(symbol.category, symbol.level, symbol.exp);
		symbol.level = newValues.currentLevel;
		symbol.exp = newValues.currentExp;

		// Reduce weekly tries. When it reaches 0, the symbol is marked as cleared.
		symbol.content[1].tries = Math.max((symbol.content[1].tries || 1) - 1, 0);
		if (symbol.content[1].tries === 0) {
			symbol.content[1].cleared = true;
		}

		// Return value
		symbol.content[1].date = dayjs().utc().toDate();
		await character.save();

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
		return createResponse<ApiResponse>({ success: false, error: 'Internal Server Error' }, 500);
	}
};

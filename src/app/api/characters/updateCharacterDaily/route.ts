import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { getToken } from 'next-auth/jwt';

import { getContentValue, calculateNewLevelFromExp, toSymbolName, isSymbolName } from '@data/symbols/symbolMappings';
import { updateCharacterDailySchema } from '@features/character/characterUpdateSchema';
import { prisma } from '@lib/prisma';
import { createResponse } from '@utils/createResponse';

import type { LevelUpResult } from '@data/symbols/symbolMappings';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

dayjs.extend(utc);

const DAILY_QUEST_CONTENT_TYPE = 'Daily Quest' as const;

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		// Extract token from the request cookies
		const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
		if (!token || typeof token.id !== 'string') {
			return createResponse<ApiResponse>({ success: false, message: 'Unauthorized' }, 401);
		}

		let body: unknown;
		try {
			body = await request.json();
		} catch {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		// Validate request body using Zod
		const parseResult = updateCharacterDailySchema.safeParse(body);
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const { symbolName, bonus, server, code } = parseResult.data;
		if (!isSymbolName(symbolName)) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid symbol name' }, 400);
		}
		const authenticatedUserId = token.id;
		const now = dayjs().utc().toDate();

		// Search for the character
		const character = await prisma.character.findUnique({
			where: {
				userId_server_code: {
					userId: authenticatedUserId,
					server,
					code,
				},
			},
			include: {
				symbols: {
					include: {
						content: true,
					},
				},
			},
		});

		if (!character) {
			return createResponse<ApiResponse>({ success: true, message: 'Character not found.' }, 200);
		}

		// Find character Symbol
		const symbol = character.symbols.find((s): boolean => s.name === symbolName);
		if (!symbol) {
			return createResponse<ApiResponse>({ success: false, message: 'Symbol not found on character' }, 404);
		}

		const dailyContent = symbol.content.find((content): boolean => content.contentType === DAILY_QUEST_CONTENT_TYPE);
		if (!dailyContent) {
			return createResponse<ApiResponse>({ success: false, message: 'Daily content not found for symbol' }, 404);
		}
		if (dailyContent.cleared === true) {
			return createResponse<ApiResponse>({ success: false, message: 'Daily already cleared.' }, 409);
		}

		// Find Symbol daily Value
		let dailyValue = getContentValue(symbolName, DAILY_QUEST_CONTENT_TYPE);

		const bonusContent = symbol.content.find(
			(content): boolean => content.checked === true && content.contentType !== DAILY_QUEST_CONTENT_TYPE,
		);

		if (bonusContent) {
			const bonusSymbolName = toSymbolName(bonusContent.contentType);

			if (bonusSymbolName) {
				dailyValue += getContentValue(bonusSymbolName, DAILY_QUEST_CONTENT_TYPE);
			}
		}

		dailyValue += bonus;

		// Update symbol exp and level
		const updatedExp = symbol.exp + dailyValue;
		const newValues = calculateNewLevelFromExp(symbol.category, symbol.level, updatedExp);

		await prisma.$transaction([
			prisma.characterSymbol.update({
				where: { id: symbol.id },
				data: {
					level: newValues.currentLevel,
					exp: newValues.currentExp,
				},
			}),
			prisma.characterContent.update({
				where: {
					symbolId_contentType: {
						symbolId: symbol.id,
						contentType: dailyContent.contentType,
					},
				},
				data: { cleared: true, date: now },
			}),
		]);

		// Return value
		return createResponse<ApiResponse<LevelUpResult>>(
			{
				success: true,
				message: 'Character updated successfully.',
				data: newValues,
			},
			200,
		);
	} catch (error) {
		console.error('Search error:', error);
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

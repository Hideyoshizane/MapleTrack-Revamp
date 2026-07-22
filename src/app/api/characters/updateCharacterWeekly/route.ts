import { getContentValue, calculateNewLevelFromExp, toSymbolName } from '@data/symbols/symbolMappings';
import { updateCharacterWeeklyRequestSchema } from '@features/character/schemas/character.request.schema';
import { updateCharacterWeeklyResponseSchema } from '@features/character/schemas/character.response.schema';
import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logError, logApiFailure, logZodError } from '@utils/logger';
import { nowInUtc } from '@utils/time';

import type { LevelUpResult } from '@data/symbols/symbolMappings';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

const route = 'api/characters/updateCharacterDaily';

const handler = async (request: NextRequest, authenticatedUserId: string): Promise<NextResponse> => {
	try {
		// Validate request body using Zod
		const parseResult = updateCharacterWeeklyRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			logZodError(parseResult.error, { route: route });

			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const { id } = parseResult.data;

		// Search for the symbol
		const symbol = await prisma.characterSymbol.findFirst({
			where: { id, character: { userId: authenticatedUserId } },
			select: {
				id: true,
				name: true,
				level: true,
				exp: true,
				category: true,
				character: { select: { level: true } },
				contents: { select: { contentType: true, tries: true, cleared: true } },
			},
		});
		if (!symbol) {
			logApiFailure('Symbol not found', { route });

			return createResponse<ApiResponse>({ success: true, message: 'Character not found.' }, 200);
		}

		let weeklyContent: (typeof symbol.contents)[number] | undefined;

		for (const content of symbol.contents) {
			if (content.tries !== null) {
				weeklyContent = content;

				break;
			}
		}
		if (!weeklyContent) {
			logApiFailure('Weekly not found', { route });

			return createResponse<ApiResponse>(
				{ success: false, message: 'Weekly content not found for symbol.' },
				404,
			);
		}
		if (weeklyContent.cleared) {
			logApiFailure('Weekly already cleared', { route });

			return createResponse<ApiResponse>({ success: false, message: 'Weekly already cleared.' }, 409);
		}

		// Find Symbol weekly Value
		const weeklyValue = getContentValue(toSymbolName(symbol.name), 'Weekly', symbol.character.level);

		// Update symbol exp and level
		const updatedExp = symbol.exp + weeklyValue;
		const newValues = calculateNewLevelFromExp(symbol.category, symbol.level, updatedExp);

		const remainingTries = Math.max((weeklyContent.tries ?? 1) - 1, 0);
		const isCleared = remainingTries === 0;

		await prisma.$transaction([
			prisma.characterSymbol.update({
				where: { id: symbol.id },
				data: { level: newValues.currentLevel, exp: newValues.currentExp },
			}),
			prisma.characterContent.update({
				where: { symbolId_contentType: { symbolId: symbol.id, contentType: weeklyContent.contentType } },
				data: { tries: remainingTries, cleared: isCleared, date: nowInUtc() },
			}),
		]);

		const responseData = { id, currentExp: newValues.currentExp, currentLevel: newValues.currentLevel };
		const validation = updateCharacterWeeklyResponseSchema.safeParse(responseData);
		if (!validation.success) {
			logZodError(validation.error, { route: route });

			return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
		}

		return createResponse<ApiResponse<LevelUpResult>>(
			{ success: true, message: 'Character updated successfully.', data: responseData },
			200,
		);
	} catch (error) {
		logError(error, { route: route });

		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const POST = routeGuard(handler);

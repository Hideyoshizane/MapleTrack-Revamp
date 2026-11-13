import { getSymbolContentType } from '@data/symbols/dailyExp';
import { getContentValue, calculateNewLevelFromExp, toSymbolName } from '@data/symbols/symbolMappings';
import { updateCharacterWeeklyRequestSchema } from '@features/character/schemas/character.request.schema';
import { updateCharacterWeeklyResponseSchema } from '@features/character/schemas/character.response.schema';
import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logZodError, logApiFailure, logError } from '@utils/logger';
import { nowInUtc } from '@utils/time';

import type { LevelUpResult } from '@data/symbols/symbolMappings';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

const route = 'api/characters/updateCharacterWeekly';

const handler = async (request: NextRequest, authenticatedUserId: string): Promise<NextResponse> => {
	try {
		// Validate request body using Zod
		const parseResult = updateCharacterWeeklyRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			logZodError(parseResult.error, { route: route });

			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const { id } = parseResult.data;

		const symbol = await prisma.characterSymbol.findFirst({
			where: { id, character: { userId: authenticatedUserId } },
			select: {
				id: true,
				name: true,
				level: true,
				exp: true,
				category: true,
				character: { select: { level: true } },
				contents: { select: { contentType: true, cleared: true } },
			},
		});
		if (!symbol) {
			logApiFailure('Symbol not found', { route });

			return createResponse<ApiResponse>({ success: false, message: 'Symbol not found' }, 404);
		}
		const weeklyContent = symbol.contents.find((content) => getSymbolContentType(content.contentType) === 'weekly');
		if (!weeklyContent) {
			logApiFailure('Weekly not found', { route });

			return createResponse<ApiResponse>({ success: false, message: 'Weekly content not found for symbol' }, 404);
		}

		const transactionData = await prisma.$transaction(async (tx) => {
			// Prevent concurrent requests from claiming the same weekly reward.
			const updatedContent = await tx.characterContent.updateMany({
				where: { symbolId: symbol.id, contentType: weeklyContent.contentType, cleared: false },
				data: { cleared: true, date: nowInUtc() },
			});
			if (updatedContent.count === 0) {
				return null;
			}

			const weeklyValue = getContentValue(toSymbolName(symbol.name), 'Weekly', symbol.character.level);

			// Update symbol exp and level
			const updatedExp = symbol.exp + weeklyValue;
			const newValues = calculateNewLevelFromExp(symbol.category, symbol.level, updatedExp);

			await tx.characterSymbol.update({
				where: { id: symbol.id },
				data: { level: newValues.currentLevel, exp: newValues.currentExp },
			});

			return { id, currentExp: newValues.currentExp, currentLevel: newValues.currentLevel };
		});

		if (!transactionData) {
			logApiFailure('Weekly already cleared.', { route });

			return createResponse<ApiResponse>({ success: false, message: 'Weekly already cleared.' }, 409);
		}

		const validation = updateCharacterWeeklyResponseSchema.safeParse(transactionData);
		if (!validation.success) {
			logZodError(validation.error, { route: route });

			return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
		}

		// Return value
		return createResponse<ApiResponse<LevelUpResult>>(
			{ success: true, message: 'Character updated successfully.', data: transactionData },
			200,
		);
	} catch (error) {
		logError(error, { route: route });

		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const POST = routeGuard(handler);

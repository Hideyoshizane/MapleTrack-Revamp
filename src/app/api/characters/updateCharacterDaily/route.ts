import { getContentValue, calculateNewLevelFromExp, toSymbolName } from '@data/symbols/symbolMappings';
import { updateCharacterDailyRequestSchema } from '@features/character/schemas/character.request.schema';
import { updateCharacterDailyResponseSchema } from '@features/character/schemas/character.response.schema';
import { addErionToLiberationDaily } from '@features/liberation/liberationService';
import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logZodError, logApiFailure, logError } from '@utils/logger';
import { nowInUtc } from '@utils/time';

import type { updateCharacterDailyResponseBody } from '@features/character/schemas/character.response.schema';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

const DAILY_QUEST_CONTENT_TYPE = 'Daily Quest' as const;

const EXTRA_AREA_CONTENTS = new Set(['Reverse City', 'Yum Yum Island']);

const route = 'api/characters/updateCharacterDaily';

const handler = async (request: NextRequest, authenticatedUserId: string): Promise<NextResponse> => {
	try {
		// Validate request body using Zod
		const parseResult = updateCharacterDailyRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			logZodError(parseResult.error, { route: route });

			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const { id, bonus } = parseResult.data;

		const symbol = await prisma.characterSymbol.findFirst({
			where: { id, character: { userId: authenticatedUserId } },
			select: {
				id: true,
				name: true,
				level: true,
				exp: true,
				category: true,
				contents: true,
				character: { select: { id: true, level: true, server: true } },
			},
		});
		if (!symbol) {
			logApiFailure('Symbol not found', { route });

			return createResponse<ApiResponse>({ success: false, message: 'Symbol not found' }, 404);
		}

		let hasExtraArea = false;

		let dailyContent: (typeof symbol.contents)[number] | undefined;

		for (const content of symbol.contents) {
			if (content.contentType === DAILY_QUEST_CONTENT_TYPE) {
				dailyContent = content;
			}

			if (content.checked && EXTRA_AREA_CONTENTS.has(content.contentType)) {
				hasExtraArea = true;
			}
		}
		if (!dailyContent) {
			logApiFailure('Daily not found', { route });

			return createResponse<ApiResponse>({ success: false, message: 'Daily content not found for symbol' }, 404);
		}
		if (dailyContent.cleared) {
			logApiFailure('Daily already cleared.', { route });

			return createResponse<ApiResponse>({ success: false, message: 'Daily already cleared.' }, 409);
		}

		let dailyValue = getContentValue(toSymbolName(symbol.name), DAILY_QUEST_CONTENT_TYPE, symbol.character.level);

		if (hasExtraArea) {
			dailyValue *= 2;
		}

		dailyValue += bonus;

		// Update symbol exp and level
		const updatedExp = symbol.exp + dailyValue;
		const newValues = calculateNewLevelFromExp(symbol.category, symbol.level, updatedExp);

		const transactionData = await prisma.$transaction(async (tx) => {
			await Promise.all([
				tx.characterSymbol.update({
					where: { id: symbol.id },
					data: { level: newValues.currentLevel, exp: newValues.currentExp },
				}),
				tx.characterContent.update({
					where: { symbolId_contentType: { symbolId: symbol.id, contentType: dailyContent.contentType } },
					data: { cleared: true, date: nowInUtc() },
				}),
			]);
			return addErionToLiberationDaily(
				tx,
				symbol.name,
				authenticatedUserId,
				symbol.character.id,
				symbol.character.server,
			);
		});

		const responseData = {
			id,
			currentExp: newValues.currentExp,
			currentLevel: newValues.currentLevel,
			erionPoints: transactionData,
		};

		const validation = updateCharacterDailyResponseSchema.safeParse(responseData);
		if (!validation.success) {
			logZodError(validation.error, { route: route });

			return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
		}

		// Return value
		return createResponse<ApiResponse<updateCharacterDailyResponseBody>>(
			{ success: true, message: 'Character updated successfully.', data: responseData },
			200,
		);
	} catch (error) {
		logError(error, { route: route });

		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const POST = routeGuard(handler);

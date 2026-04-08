import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { getContentValue, calculateNewLevelFromExp, toSymbolName } from '@data/symbols/symbolMappings';
import { updateCharacterDailyRequestSchema } from '@features/character/schemas/character.request.schema';
import { updateCharacterDailyResponseSchema } from '@features/character/schemas/character.response.schema';
import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logZodError, logApiFailure, logError } from '@utils/logger';

import type { updateCharacterDailyResponseBody } from '@features/character/schemas/character.response.schema';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

dayjs.extend(utc);

const DAILY_QUEST_CONTENT_TYPE = 'Daily Quest' as const;

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

		const now = dayjs().utc().toDate();

		const symbol = await prisma.characterSymbol.findFirst({
			where: { id: id, character: { userId: authenticatedUserId } },
			select: { id: true, name: true, level: true, exp: true, category: true, contents: true },
		});

		if (!symbol) {
			logApiFailure('Symbol not found', { route });
			return createResponse<ApiResponse>({ success: false, message: 'Symbol not found' }, 404);
		}

		const dailyContent = symbol.contents.find((content): boolean => content.contentType === DAILY_QUEST_CONTENT_TYPE);
		if (!dailyContent) {
			logApiFailure('Daily not found', { route });
			return createResponse<ApiResponse>({ success: false, message: 'Daily content not found for symbol' }, 404);
		}
		if (dailyContent.cleared === true) {
			logApiFailure('Daily already cleared.', { route });
			return createResponse<ApiResponse>({ success: false, message: 'Daily already cleared.' }, 409);
		}

		// Find Symbol daily Value
		let dailyValue = getContentValue(toSymbolName(symbol.name), DAILY_QUEST_CONTENT_TYPE);

		const extraArea: ReadonlySet<string> = new Set(['Reverse City', 'Yum Yum Island']);
		const extraAreaContent = symbol.contents.some(
			(content): boolean => content.checked === true && extraArea.has(content.contentType),
		);

		if (extraAreaContent) {
			dailyValue += dailyValue;
		}

		dailyValue += bonus;

		// Update symbol exp and level
		const updatedExp = symbol.exp + dailyValue;
		const newValues = calculateNewLevelFromExp(symbol.category, symbol.level, updatedExp);

		await prisma.$transaction([
			prisma.characterSymbol.update({
				where: { id: symbol.id },
				data: { level: newValues.currentLevel, exp: newValues.currentExp },
			}),
			prisma.characterContent.update({
				where: { symbolId_contentType: { symbolId: symbol.id, contentType: dailyContent.contentType } },
				data: { cleared: true, date: now },
			}),
		]);

		const returnData = { id: id, currentExp: newValues.currentExp, currentLevel: newValues.currentLevel };
		const validation = updateCharacterDailyResponseSchema.safeParse(returnData);
		if (!validation.success) {
			logZodError(validation.error, { route: route });
			return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
		}

		// Return value
		return createResponse<ApiResponse<updateCharacterDailyResponseBody>>(
			{ success: true, message: 'Character updated successfully.', data: returnData },
			200,
		);
	} catch (error) {
		logError(error, { route: route });
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const POST = routeGuard(handler);

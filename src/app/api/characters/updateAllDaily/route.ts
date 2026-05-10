import {
	getContentValue,
	calculateNewLevelFromExp,
	canUseSymbol,
	getSymbolMaxLevel,
	isSymbolName,
} from '@data/symbols/symbolMappings';
import { updateCharacterAllDailyRequestSchema } from '@features/character/schemas/character.request.schema';
import { updateCharacterAllDailyResponseSchema } from '@features/character/schemas/character.response.schema';
import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logError, logApiFailure, logZodError } from '@utils/logger';
import { nowInUtc } from '@utils/time';

import type { LevelUpResult } from '@data/symbols/symbolMappings';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

const DAILY_CONTENT_TYPE = 'Daily Quest' as const;

const EXTRA_AREA_CONTENTS = new Set(['Reverse City', 'Yum Yum Island']);

const route = 'api/characters/updateAllDaily';

const handler = async (request: NextRequest, authenticatedUserId: string): Promise<NextResponse> => {
	try {
		// Validate request body using Zod
		const parseResult = updateCharacterAllDailyRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			logZodError(parseResult.error, { route: route });

			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const { server, className, id, arcaneBonus, sacredBonus } = parseResult.data;

		// Search for the character and update
		const updatedResults = await prisma.$transaction(async (tx) => {
			const character = await tx.character.findFirst({
				where: { id, userId: authenticatedUserId, server, class: className },
				select: {
					level: true,
					symbols: {
						select: {
							id: true,
							name: true,
							level: true,
							exp: true,
							category: true,
							contents: { select: { contentType: true, checked: true, cleared: true } },
						},
					},
				},
			});
			if (!character) {
				return null;
			}
			const currentDate = nowInUtc();

			const results: Record<string, LevelUpResult> = {};
			const symbolUpdatePromises: Promise<unknown>[] = [];
			const contentUpdatePromises: Promise<unknown>[] = [];

			for (const symbol of character.symbols) {
				if (!isSymbolName(symbol.name)) {
					continue;
				}

				if (!canUseSymbol(character.level, symbol.name)) {
					continue;
				}

				const maxLevel = getSymbolMaxLevel(symbol.category);
				if (symbol.level >= maxLevel) {
					continue;
				}

				let dailyContent: (typeof symbol.contents)[number] | undefined;
				let hasExtraArea = false;

				for (const content of symbol.contents) {
					if (content.contentType === DAILY_CONTENT_TYPE) {
						dailyContent = content;
					}
					if (content.checked && EXTRA_AREA_CONTENTS.has(content.contentType)) {
						hasExtraArea = true;
					}
				}
				if (!dailyContent || dailyContent.cleared || !dailyContent.checked) {
					continue;
				}

				let dailyValue = getContentValue(symbol.name, DAILY_CONTENT_TYPE, character.level);
				if (hasExtraArea) {
					dailyValue *= 2;
				}

				dailyValue += symbol.category === 'arcane' ? (arcaneBonus ?? 0) : (sacredBonus ?? 0);

				const updatedExp = symbol.exp + dailyValue;

				const newValues = calculateNewLevelFromExp(symbol.category, symbol.level, updatedExp);

				results[symbol.name] = newValues;

				symbolUpdatePromises.push(
					tx.characterSymbol.update({
						where: { id: symbol.id },
						data: { level: newValues.currentLevel, exp: newValues.currentExp },
					}),
				);

				contentUpdatePromises.push(
					tx.characterContent.update({
						where: { symbolId_contentType: { symbolId: symbol.id, contentType: DAILY_CONTENT_TYPE } },
						data: { cleared: true, date: currentDate },
					}),
				);
			}

			if (symbolUpdatePromises.length > 0 || contentUpdatePromises.length > 0) {
				await Promise.all([...symbolUpdatePromises, ...contentUpdatePromises]);
			}

			return results;
		});

		if (!updatedResults) {
			logApiFailure('Character not found', { route });
			return createResponse<ApiResponse>({ success: true, message: 'Character not found.' }, 200);
		}

		const validation = updateCharacterAllDailyResponseSchema.safeParse(updatedResults);
		if (!validation.success) {
			logZodError(validation.error, { route });

			throw new Error('Invalid response data');
		}

		return createResponse<ApiResponse<Record<string, LevelUpResult>>>(
			{ success: true, message: 'Character updated successfully.', data: updatedResults },
			200,
		);
	} catch (error) {
		logError(error, { route: route });

		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const POST = routeGuard(handler);

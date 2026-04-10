import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

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

import type { LevelUpResult } from '@data/symbols/symbolMappings';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

dayjs.extend(utc);

const DAILY_CONTENT_TYPE = 'Daily Quest' as const;

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
		const now = dayjs().utc().toDate();

		// Search for the character and update
		const updatedResults = await prisma.$transaction(async (tx) => {
			const character = await tx.character.findUnique({
				where: { id: id, userId: authenticatedUserId, server: server, class: className },
				include: {
					symbols: { select: { id: true, name: true, level: true, exp: true, category: true, contents: true } },
				},
			});

			if (!character) {
				return null;
			}
			const results: Record<string, LevelUpResult> = {};
			const symbolUpdates: Parameters<typeof tx.characterSymbol.update>[0][] = [];
			const contentUpdates: Parameters<typeof tx.characterContent.update>[0][] = [];

			// Helper to process symbol array
			const processCategory = (category: 'arcane' | 'sacred' | 'grand', bonus: number): void => {
				const symbols = character.symbols.filter((symbol): boolean => symbol.category === category);

				for (const symbol of symbols) {
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

					const dailyContent = symbol.contents.find((content): boolean => content.contentType === DAILY_CONTENT_TYPE);
					if (!dailyContent || dailyContent.cleared || dailyContent.checked !== true) {
						continue;
					}

					let dailyValue = getContentValue(symbol.name, DAILY_CONTENT_TYPE);
					const extraArea: ReadonlySet<string> = new Set(['Reverse City', 'Yum Yum Island']);
					const extraAreaContent = symbol.contents.some(
						(content): boolean => content.checked === true && extraArea.has(content.contentType),
					);
					if (extraAreaContent) {
						dailyValue += dailyValue;
					}

					dailyValue += bonus;

					const updatedExp = symbol.exp + dailyValue;
					const newValues = calculateNewLevelFromExp(symbol.category, symbol.level, updatedExp);

					symbolUpdates.push({
						where: { id: symbol.id },
						data: { level: newValues.currentLevel, exp: newValues.currentExp },
					});

					contentUpdates.push({
						where: { symbolId_contentType: { symbolId: symbol.id, contentType: dailyContent.contentType } },
						data: { cleared: true, date: now },
					});

					results[symbol.name] = newValues;
				}
			};

			processCategory('arcane', arcaneBonus ?? 0);
			processCategory('sacred', sacredBonus ?? 0);
			processCategory('grand', sacredBonus ?? 0);

			await Promise.all([
				...symbolUpdates.map((args) => tx.characterSymbol.update(args)),
				...contentUpdates.map((args) => tx.characterContent.update(args)),
			]);

			return results;
		});

		if (!updatedResults) {
			logApiFailure('Character not found', { route });
			return createResponse<ApiResponse>({ success: true, message: 'Character not found.' }, 200);
		}

		const validation = updateCharacterAllDailyResponseSchema.safeParse(updatedResults);
		if (!validation.success) {
			logZodError(validation.error, { route: route });
			return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
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

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { DEFAULT_WEEKLY_TRIES } from '@data/character/constants';
import { calculateNewLevelFromExp } from '@data/symbols/symbolMappings';
import { characterToBossList } from '@features/boss/bossListService';
import { updateCharacterRequestSchema } from '@features/character/schemas/character.request.schema';
import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logZodError } from '@utils/logger';

import type { SymbolCategory } from '@prisma/client';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

type SymbolCategoryKey = 'arcane' | 'sacred' | 'grand';

const symbolCategoryKeys: SymbolCategoryKey[] = ['arcane', 'sacred', 'grand'];

dayjs.extend(utc);

const route = 'api/characters/updateCharacter';

const handler = async (request: NextRequest, authenticatedUserId: string): Promise<NextResponse> => {
	try {
		// Validate request body using Zod
		const parseResult = updateCharacterRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			logZodError(parseResult.error, { route: route });
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const { server, class: className, id } = parseResult.data;
		const data = parseResult.data;
		const now = dayjs().utc().toDate();

		const isValidObjectId = (value: string): boolean => {
			return value.length === 24;
		};

		const whereClause = isValidObjectId(id)
			? { id: id }
			: { userId_server_class: { userId: authenticatedUserId, server, class: className } };

		await prisma.$transaction(async (tx) => {
			const existingCharacter = await tx.character.findUnique({
				where: whereClause,
				select: {
					id: true,
					bossing: true,
				},
			});

			const isNullLevel = data.level == 0;

			const character = await tx.character.upsert({
				where: whereClause,
				create: {
					name: data.name,
					level: isNullLevel ? 10 : data.level,
					targetLevel: data.targetLevel,
					class: data.class,
					jobType: data.jobType,
					legion: data.legion,
					linkSkill: data.linkSkill,
					bossing: data.bossing,
					syncing: data.syncing,
					userId: authenticatedUserId,
					server,
					lastUpdate: now,
				},
				update: {
					name: data.name,
					level: isNullLevel ? 10 : data.level,
					targetLevel: data.targetLevel,
					class: data.class,
					jobType: data.jobType,
					legion: data.legion,
					linkSkill: data.linkSkill,
					bossing: data.bossing,
					syncing: data.syncing,
					lastUpdate: now,
				},
			});

			const shouldSyncBossList = existingCharacter === null || existingCharacter.bossing !== data.bossing;

			for (const categoryKey of symbolCategoryKeys) {
				const symbolsInCategory = data.symbols[categoryKey];

				for (const symbol of symbolsInCategory) {
					const isInitialState = symbol.level === 1 && symbol.exp === 0;
					const matchingSymbol = data.symbols[categoryKey].find((s) => s.name === symbol.name);
					if (!matchingSymbol) {
						continue;
					}
					const newValues = calculateNewLevelFromExp(
						symbol.category as SymbolCategory,
						matchingSymbol.level,
						matchingSymbol.exp,
					);

					const symbolRecord = await tx.characterSymbol.upsert({
						where: { characterId_name: { characterId: character.id, name: symbol.name } },
						create: {
							name: symbol.name,
							level: newValues.currentLevel,
							exp: isInitialState ? 1 : newValues.currentExp,
							category: categoryKey,
							characterId: character.id,
						},
						update: { level: newValues.currentLevel, exp: newValues.currentExp, category: categoryKey },
					});

					const triesAttributeExclude: ReadonlySet<string> = new Set(['Daily Quest', 'Reverse City', 'Yum Yum Island']);

					for (const content of symbol.contents) {
						await tx.characterContent.upsert({
							where: { symbolId_contentType: { symbolId: symbolRecord.id, contentType: content.contentType } },
							create: {
								contentType: content.contentType,
								checked: content.checked,
								...(!triesAttributeExclude.has(content.contentType) && { tries: DEFAULT_WEEKLY_TRIES }),
								symbolId: symbolRecord.id,
							},
							update: { checked: content.checked },
						});
					}
				}
			}
			if (shouldSyncBossList) {
				await characterToBossList(tx, authenticatedUserId, server, character.id, data.bossing);
			}
		});

		return createResponse<ApiResponse>({ success: true, message: 'Character updated successfully.' }, 200);
	} catch (error) {
		console.error('Search error:', error);
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const PATCH = routeGuard(handler);

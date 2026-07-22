import { DEFAULT_WEEKLY_TRIES } from '@data/character/constants';
import { calculateNewLevelFromExp } from '@data/symbols/symbolMappings';
import { characterToBossList } from '@features/boss/bossListService';
import { updateCharacterRequestSchema } from '@features/character/schemas/character.request.schema';
import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logZodError } from '@utils/logger';
import { nowInUtc } from '@utils/time';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

type SymbolCategoryKey = 'arcane' | 'sacred' | 'grand';
const symbolCategoryKeys: SymbolCategoryKey[] = ['arcane', 'sacred', 'grand'];

const TRIES_ATTRIBUTE_EXCLUDE = new Set(['Daily Quest', 'Reverse City', 'Yum Yum Island']);

const isValidObjectId = (value: string): boolean => value.length === 24;

const route = 'api/characters/updateCharacter';

const handler = async (request: NextRequest, authenticatedUserId: string): Promise<NextResponse> => {
	try {
		// Validate request body using Zod
		const parseResult = updateCharacterRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			logZodError(parseResult.error, { route: route });

			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const data = parseResult.data;

		const whereClause = isValidObjectId(data.id)
			? { id: data.id }
			: { userId_server_class: { userId: authenticatedUserId, server: data.server, class: data.class } };

		const currentDate = nowInUtc();

		await prisma.$transaction(async (tx) => {
			const existingCharacter = await tx.character.findUnique({
				where: whereClause,
				select: { id: true, bossing: true },
			});

			const normalizedLevel = data.level === 0 ? 10 : data.level;

			const character = await tx.character.upsert({
				where: whereClause,
				create: {
					name: data.name,
					level: normalizedLevel,
					targetLevel: data.targetLevel,
					class: data.class,
					jobType: data.jobType,
					legion: data.legion,
					linkSkill: data.linkSkill,
					lastSymbolDaily: data.lastSymbolDaily,
					bossing: data.bossing,
					syncing: data.syncing,
					userId: authenticatedUserId,
					server: data.server,
					lastUpdate: currentDate,
				},
				update: {
					name: data.name,
					level: normalizedLevel,
					targetLevel: data.targetLevel,
					class: data.class,
					jobType: data.jobType,
					legion: data.legion,
					linkSkill: data.linkSkill,
					bossing: data.bossing,
					syncing: data.syncing,
					lastUpdate: currentDate,
					lastSymbolDaily: data.lastSymbolDaily,
				},
				select: { id: true },
			});

			const shouldSyncBossList = !existingCharacter || existingCharacter.bossing !== data.bossing;

			const symbolUpsertPromises: Promise<{ id: string }>[] = [];

			type ContentPayload = {
				symbolName: string;
				contentType: string;
				checked: boolean;
			};

			const pendingContents: ContentPayload[] = [];

			for (const categoryKey of symbolCategoryKeys) {
				const symbols = data.symbols[categoryKey];

				for (const symbol of symbols) {
					const calculatedValues = calculateNewLevelFromExp(symbol.category, symbol.level, symbol.exp);

					const isInitialState = symbol.level === 1 && symbol.exp === 0;

					symbolUpsertPromises.push(
						tx.characterSymbol.upsert({
							where: { characterId_name: { characterId: character.id, name: symbol.name } },
							create: {
								name: symbol.name,
								level: calculatedValues.currentLevel,
								exp: isInitialState ? 1 : calculatedValues.currentExp,
								category: categoryKey,
								characterId: character.id,
							},
							update: {
								level: calculatedValues.currentLevel,
								exp: calculatedValues.currentExp,
								category: categoryKey,
							},
							select: { id: true },
						}),
					);

					for (const content of symbol.contents) {
						pendingContents.push({
							symbolName: symbol.name,
							contentType: content.contentType,
							checked: content.checked ?? false,
						});
					}
				}
			}

			const symbolRecords = await Promise.all(symbolUpsertPromises);

			const symbolIdMap = new Map<string, string>();

			let symbolIndex = 0;

			for (const categoryKey of symbolCategoryKeys) {
				for (const symbol of data.symbols[categoryKey]) {
					const symbolRecord = symbolRecords[symbolIndex];
					symbolIdMap.set(symbol.name, symbolRecord.id);
					symbolIndex += 1;
				}
			}

			const contentUpsertPromises: Promise<unknown>[] = [];

			for (const content of pendingContents) {
				const symbolId = symbolIdMap.get(content.symbolName);
				if (!symbolId) {
					continue;
				}

				contentUpsertPromises.push(
					tx.characterContent.upsert({
						where: { symbolId_contentType: { symbolId, contentType: content.contentType } },
						create: {
							contentType: content.contentType,
							checked: content.checked,
							...(!TRIES_ATTRIBUTE_EXCLUDE.has(content.contentType) && { tries: DEFAULT_WEEKLY_TRIES }),
							symbolId,
						},
						update: { checked: content.checked },
					}),
				);
			}

			if (contentUpsertPromises.length > 0) {
				await Promise.all(contentUpsertPromises);
			}

			if (shouldSyncBossList) {
				await characterToBossList(tx, authenticatedUserId, data.server, character.id, data.bossing);
			}
		});

		return createResponse<ApiResponse>({ success: true, message: 'Character updated successfully.' }, 200);
	} catch (error) {
		console.error('Search error:', error);

		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const PATCH = routeGuard(handler);

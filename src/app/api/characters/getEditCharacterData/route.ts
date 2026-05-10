import { getClassByName } from '@data/classes/classes';
import { sortSymbolContents, sortSymbolsByMinLevel } from '@data/symbols/symbolMappings';
import { generateCharacterObjectEditCharacterPage, groupSymbolsByCategory } from '@features/character/characterService';
import { getCharacterDataRequestSchema } from '@features/character/schemas/character.request.schema';
import { getEditCharacterDataResponseSchema } from '@features/character/schemas/character.response.schema';
import { syncCharacterInfo } from '@lib/characters';
import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logError, logZodError, logApiFailure } from '@utils/logger';

import type { getEditCharacterDataResponseBody } from '@features/character/schemas/character.response.schema';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

const route = 'api/characters/getCharacterData';

const handler = async (request: NextRequest, authenticatedUserId: string): Promise<NextResponse> => {
	try {
		// Validate request body using Zod
		const parseResult = getCharacterDataRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			logZodError(parseResult.error, { route: route });

			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const { server, className } = parseResult.data;

		await syncCharacterInfo({ authenticatedUserId, server, className });

		const character = await prisma.character.findUnique({
			where: { userId_server_class: { userId: authenticatedUserId, server, class: className } },
			select: {
				id: true,
				name: true,
				level: true,
				targetLevel: true,
				class: true,
				jobType: true,
				legion: true,
				linkSkill: true,
				bossing: true,
				syncing: true,
				symbols: {
					select: {
						id: true,
						name: true,
						level: true,
						exp: true,
						category: true,
						contents: { select: { contentType: true, checked: true, cleared: true, tries: true } },
					},
				},
			},
		});

		let responseData: getEditCharacterDataResponseBody;

		//if not in database, return a generic object.
		if (!character) {
			const classData = getClassByName(className);
			if (!classData) {
				logApiFailure('Class name not found', { route });

				return createResponse<ApiResponse>({ success: false, message: `Class with name ${className} not found` }, 404);
			}

			responseData = generateCharacterObjectEditCharacterPage({
				jobClassName: classData.className,
				jobType: classData.jobType,
				legion: classData.legionType,
				linkSkill: classData.linkSkill,
			});
		} else {
			const normalizedSymbols = new Array(character.symbols.length);

			for (let symbolIndex = 0; symbolIndex < character.symbols.length; symbolIndex += 1) {
				const symbol = character.symbols[symbolIndex];

				const normalizedContents = new Array(symbol.contents.length);

				for (let contentIndex = 0; contentIndex < symbol.contents.length; contentIndex += 1) {
					const content = symbol.contents[contentIndex];

					normalizedContents[contentIndex] = {
						contentType: content.contentType,
						checked: content.checked,
						cleared: content.cleared,
						tries: content.tries ?? undefined,
					};
				}

				normalizedSymbols[symbolIndex] = {
					id: symbol.id,
					name: symbol.name,
					level: symbol.level,
					exp: symbol.exp,
					category: symbol.category,

					contents: sortSymbolContents(symbol.name, normalizedContents),
				};
			}

			const sortedSymbols = sortSymbolsByMinLevel(normalizedSymbols);

			const groupedSymbols = groupSymbolsByCategory(sortedSymbols);

			responseData = {
				id: character.id,
				name: character.name,
				level: character.level,
				targetLevel: character.targetLevel,
				class: character.class,
				jobType: character.jobType,
				legion: character.legion,
				linkSkill: character.linkSkill,
				bossing: character.bossing,
				syncing: character.syncing,

				symbols: groupedSymbols,
			};

			const validation = getEditCharacterDataResponseSchema.safeParse(responseData);
			if (!validation.success) {
				logZodError(validation.error, { route: route });

				return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
			}
		}

		return createResponse<ApiResponse<getEditCharacterDataResponseBody>>(
			{ success: true, message: 'Request processed.', data: responseData },
			200,
		);
	} catch (error) {
		logError(error, { route: route });
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const POST = routeGuard(handler);

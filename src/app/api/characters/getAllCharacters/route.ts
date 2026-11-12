import { sortSymbolsByMinLevel } from '@data/symbols/symbolMappings';
import { getAllCharactersRequestSchema } from '@features/character/schemas/character.request.schema';
import { getAllCharactersResponseSchema } from '@features/character/schemas/character.response.schema';
import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logError, logZodError } from '@utils/logger';

import type { getAllCharactersResponseBody } from '@features/character/schemas/character.response.schema';
import type { SymbolCategory } from '@generated/prisma/client';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

const route = 'api/characters/getAllCharacters';

const handler = async (request: NextRequest, authenticatedUserId: string): Promise<NextResponse> => {
	try {
		const parseResult = getAllCharactersRequestSchema.safeParse(await request.json());

		if (!parseResult.success) {
			logZodError(parseResult.error, { route });

			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const { server } = parseResult.data;

		const characters = await prisma.character.findMany({
			where: { userId: authenticatedUserId, server },
			select: {
				name: true,
				class: true,
				jobType: true,
				legion: true,
				level: true,
				targetLevel: true,
				linkSkill: true,
				bossing: true,
				symbols: {
					where: { category: { in: ['arcane', 'sacred'] } },
					select: { category: true, name: true, level: true },
				},
			},
		});

		const formattedCharacters: getAllCharactersResponseBody[] = characters.map((character) => {
			const sortedSymbols = sortSymbolsByMinLevel(character.symbols);

			const groupedSymbols: Record<Exclude<SymbolCategory, 'grand'>, typeof sortedSymbols> = {
				arcane: [],
				sacred: [],
			};

			for (const symbol of sortedSymbols) {
				if (symbol.category === 'grand') {
					continue;
				}

				groupedSymbols[symbol.category].push(symbol);
			}

			return {
				name: character.name,
				class: character.class,
				jobType: character.jobType,
				legion: character.legion,
				level: character.level,
				targetLevel: character.targetLevel,
				linkSkill: character.linkSkill,
				bossing: character.bossing,
				symbols: groupedSymbols,
			};
		});

		for (const character of formattedCharacters) {
			const validation = getAllCharactersResponseSchema.safeParse(character);
			if (!validation.success) {
				logZodError(validation.error, { route });

				throw new Error('Invalid character data');
			}
		}

		return createResponse<ApiResponse<getAllCharactersResponseBody[]>>(
			{ success: true, message: 'Request processed.', data: formattedCharacters },
			200,
		);
	} catch (error) {
		logError(error, { route });

		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const POST = routeGuard(handler);

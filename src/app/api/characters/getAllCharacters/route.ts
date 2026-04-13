import { getAllCharactersRequestSchema } from '@features/character/schemas/character.request.schema';
import { getAllCharactersResponseSchema } from '@features/character/schemas/character.response.schema';
import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logError, logZodError } from '@utils/logger';

import type { getAllCharactersResponseBody } from '@features/character/schemas/character.response.schema';
import type { SymbolCategory } from '@prisma/client';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

const route = 'api/characters/getAllCharacters';
const handler = async (request: NextRequest, authenticatedUserId: string): Promise<NextResponse> => {
	try {
		// Validate request body using Zod
		const parseResult = getAllCharactersRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			logZodError(parseResult.error, { route: route });
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}
		const { server } = parseResult.data;

		// Query characters by id and server
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
				symbols: { select: { category: true, name: true, level: true } },
			},
		});

		const validatedCharacters = characters.map((c) => {
			// Filter out grand symbols
			const filteredSymbols = c.symbols.filter((s) => s.category !== 'grand');

			// Group remaining symbols by category
			const groupedSymbols = filteredSymbols.reduce<Record<Exclude<SymbolCategory, 'grand'>, typeof filteredSymbols>>(
				(acc, symbol) => {
					(acc[symbol.category as Exclude<SymbolCategory, 'grand'>] ||= []).push(symbol);
					return acc;
				},
				{ arcane: [], sacred: [] },
			);
			const characterWithGroupedSymbols = { ...c, symbols: groupedSymbols };

			const validation = getAllCharactersResponseSchema.safeParse(characterWithGroupedSymbols);
			if (!validation.success) {
				logZodError(validation.error, { route });
				throw new Error('Invalid character data');
			}
			return validation.data;
		});

		return createResponse<ApiResponse<getAllCharactersResponseBody[]>>(
			{ success: true, message: 'Request processed.', data: validatedCharacters },
			200,
		);
	} catch (error) {
		logError(error, { route: route });
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const POST = routeGuard(handler);

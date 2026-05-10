import { findBestClassMatch } from '@data/classes/classes';
import { getServersExcept } from '@data/servers/servers';
import { searchCharacterRequestSchema } from '@features/character/schemas/character.request.schema';
import { searchCharacterResponseSchema } from '@features/character/schemas/character.response.schema';
import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logError, logZodError } from '@utils/logger';

import type { searchCharacterResponseBody } from '@features/character/schemas/character.response.schema';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

const MAX_RESULTS = 6;

const route = 'api/characters/searchCharacter';

const handler = async (request: NextRequest, authenticatedUserId: string): Promise<NextResponse> => {
	try {
		const searchTerm = new URL(request.url).searchParams.get('parameters');
		if (!searchTerm) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const parseResult = searchCharacterRequestSchema.safeParse({ parameters: searchTerm });
		if (!parseResult.success) {
			logZodError(parseResult.error, { route: route });

			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const normalizedSearchTerm = searchTerm.trim();

		const baseResults = await prisma.character.findMany({
			where: {
				userId: authenticatedUserId,
				OR: [
					{ name: { contains: normalizedSearchTerm, mode: 'insensitive' } },
					{ class: { contains: normalizedSearchTerm, mode: 'insensitive' } },
				],
			},
			select: { name: true, class: true, level: true, server: true },
			orderBy: { name: 'asc' },
			take: MAX_RESULTS,
		});

		const finalResults = baseResults.slice();

		if (finalResults.length < MAX_RESULTS) {
			const matchedClass = findBestClassMatch(normalizedSearchTerm);

			if (matchedClass) {
				const existingNames = new Set(finalResults.map((character): string => character.name));

				const remainingResults = MAX_RESULTS - finalResults.length;

				if (remainingResults > 0) {
					const extraResults = await prisma.character.findMany({
						where: {
							userId: authenticatedUserId,
							class: { equals: matchedClass, mode: 'insensitive' },
							name: { notIn: Array.from(existingNames) },
						},
						select: { name: true, class: true, level: true, server: true },
						orderBy: { name: 'asc' },
						take: remainingResults,
					});

					for (const result of extraResults) {
						finalResults.push(result);
						existingNames.add(result.name);
					}
				}

				const missingResults = MAX_RESULTS - finalResults.length;

				if (missingResults > 0) {
					const usedServers = new Set(finalResults.map((character): string => character.server));

					const generatedServers = getServersExcept(missingResults, Array.from(usedServers));

					for (const server of generatedServers) {
						finalResults.push({ name: 'Character', level: 0, class: matchedClass, server });
					}
				}
			}
		}

		const responseData = { characters: finalResults };

		const validation = searchCharacterResponseSchema.safeParse(responseData);
		if (!validation.success) {
			logZodError(validation.error, {
				route,
			});

			throw new Error('Invalid search response');
		}

		return createResponse<ApiResponse<searchCharacterResponseBody>>(
			{ success: true, message: 'Character updated successfully.', data: responseData },
			200,
		);
	} catch (error) {
		logError(error, { route: route });

		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const GET = routeGuard(handler);

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

const route = 'api/characters/searchCharacter';

const handler = async (request: NextRequest, authenticatedUserId: string): Promise<NextResponse> => {
	try {
		const { searchParams } = new URL(request.url);
		const searchTerm = searchParams.get('parameters');
		if (!searchTerm) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const parseResult = searchCharacterRequestSchema.safeParse({ parameters: searchTerm });
		if (!parseResult.success) {
			logZodError(parseResult.error, { route: route });

			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const baseResults = await prisma.character.findMany({
			where: {
				userId: authenticatedUserId,
				OR: [
					{ name: { contains: searchTerm, mode: 'insensitive' } },
					{ class: { contains: searchTerm, mode: 'insensitive' } },
				],
			},
			select: { name: true, class: true, server: true },
			orderBy: { name: 'asc' },
			take: 6,
		});

		let finalResults = baseResults;

		if (baseResults.length < 6) {
			const match = findBestClassMatch(searchTerm);
			const remaining = 6 - baseResults.length;
			if (match) {
				const extraResults = await prisma.character.findMany({
					where: {
						userId: authenticatedUserId,
						class: { equals: match, mode: 'insensitive' },
						NOT: baseResults.map((c) => ({ name: c.name })),
					},
					select: { name: true, class: true, level: true, server: true },
					orderBy: { name: 'asc' },
					take: remaining,
				});

				finalResults = [...baseResults, ...extraResults];

				const extraStep = 6 - finalResults.length;
				if (extraStep > 0) {
					const uniqueServers: string[] = Array.from(new Set(finalResults.map((c): string => c.server)));

					const allowedServers = getServersExcept(extraStep, uniqueServers);
					const generatedResults = allowedServers.map((server): (typeof finalResults)[number] => {
						return { name: 'Character', class: match, server };
					});

					finalResults = [...finalResults, ...generatedResults];
				}
			}
		}

		const returnQuery = { characters: finalResults };

		const validation = searchCharacterResponseSchema.safeParse(returnQuery);
		if (!validation.success) {
			logZodError(validation.error, { route: route });

			return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
		}

		return createResponse<ApiResponse<searchCharacterResponseBody>>(
			{ success: true, message: 'Character updated successfully.', data: returnQuery },
			200,
		);
	} catch (error) {
		logError(error, { route: route });

		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const GET = routeGuard(handler);

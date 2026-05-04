import { getClassByName } from '@data/classes/classes';
import { generateCharacterObjectCharacterPage, groupSymbolsByCategory } from '@features/character/characterService';
import { getCharacterDataRequestSchema } from '@features/character/schemas/character.request.schema';
import { getCharacterDataResponseSchema } from '@features/character/schemas/character.response.schema';
import { syncCharacterInfo } from '@lib/characters';
import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logError, logZodError, logApiFailure } from '@utils/logger';

import type { getCharacterDataResponseBody } from '@features/character/schemas/character.response.schema';
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

		let responseData: getCharacterDataResponseBody;

		//if not in database, return a generic object.
		if (!character) {
			const classData = getClassByName(className);
			if (!classData) {
				logApiFailure('Class name not found', { route });

				return createResponse<ApiResponse>({ success: false, message: `Class with name ${className} not found` }, 404);
			}

			responseData = generateCharacterObjectCharacterPage({
				jobClassName: classData.className,
				jobType: classData.jobType,
				legion: classData.legionType,
				linkSkill: classData.linkSkill,
			});
		} else {
			const normalizedSymbols = character.symbols.map((symbol) => ({
				...symbol,
				contents: symbol.contents.map((content) => ({ ...content, tries: content.tries ?? undefined })),
			}));
			const symbols = groupSymbolsByCategory(normalizedSymbols);
			responseData = getCharacterDataResponseSchema.parse({ ...character, symbols: symbols });
		}

		return createResponse<ApiResponse<getCharacterDataResponseBody>>(
			{ success: true, message: 'Request processed.', data: responseData },
			200,
		);
	} catch (error) {
		logError(error, { route: route });

		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const POST = routeGuard(handler);

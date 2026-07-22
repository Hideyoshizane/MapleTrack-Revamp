import { getLiberationListRequestSchema } from '@features/liberation/schemas/liberation.request.schema';
import { getLiberationListResponseSchema } from '@features/liberation/schemas/liberation.response.schema';
import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logZodError, logError, logApiFailure } from '@utils/logger';

import type {
	getLiberationListResponseBody,
	GetLiberationListCharacterResponseBody,
} from '@features/liberation/schemas/liberation.response.schema';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

const route = 'api/liberation/getLiberationList';

const handler = async (request: NextRequest, authenticatedUserId: string): Promise<NextResponse> => {
	try {
		// Validate request body using Zod
		const parseResult = getLiberationListRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			logZodError(parseResult.error, { route: route });

			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const { server } = parseResult.data;

		const liberationList = await prisma.liberation.findMany({
			where: { userId: authenticatedUserId, server: server },
			select: {
				id: true,
				characterId: true,
				currentGenesisQuest: true,
				currentGenesisPoints: true,
				genesisPass: true,
				liberated: true,
				currentDestinyQuest: true,
				currentDestinyPoints: true,
				currentAstraQuest: true,
				currentAstraTracesPoints: true,
				currentAstraVestigesPoints: true,
				character: { select: { name: true, class: true, level: true } },
			},
		});

		if (liberationList.length === 0) {
			logApiFailure('List not found', { route });

			return createResponse<ApiResponse>({ success: false, message: 'List not found.' }, 200);
		}

		const userData = await prisma.user.findUnique({
			where: { id: authenticatedUserId },
			select: { liberationLastUpdate: true },
		});

		const characters: GetLiberationListCharacterResponseBody[] = Array.from({ length: liberationList.length });

		for (let liberationIndex = 0; liberationIndex < liberationList.length; liberationIndex += 1) {
			const liberation = liberationList[liberationIndex];

			characters[liberationIndex] = {
				id: liberation.id,
				characterId: liberation.characterId,
				currentGenesisQuest: liberation.currentGenesisQuest,
				currentGenesisPoints: liberation.currentGenesisPoints,

				genesisPass: liberation.genesisPass ?? undefined,
				liberated: liberation.liberated ?? undefined,

				currentDestinyQuest: liberation.currentDestinyQuest,
				currentDestinyPoints: liberation.currentDestinyPoints,
				currentAstraQuest: liberation.currentAstraQuest,

				currentAstraTracesPoints: liberation.currentAstraTracesPoints,
				currentAstraVestigesPoints: liberation.currentAstraVestigesPoints,

				name: liberation.character.name,
				class: liberation.character.class,
				level: liberation.character.level,
			};
		}

		const responsePayload: getLiberationListResponseBody = {
			liberationLastUpdate: userData?.liberationLastUpdate ?? new Date(0),
			characters,
		};

		const validation = getLiberationListResponseSchema.safeParse(responsePayload);
		if (!validation.success) {
			logZodError(validation.error, { route });

			throw new Error('Invalid Liberation List data');
		}

		// Success response
		return createResponse<ApiResponse<getLiberationListResponseBody>>(
			{ success: true, message: 'List found.', data: responsePayload },
			200,
		);
	} catch (error) {
		logError(error, { route: route });

		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const POST = routeGuard(handler);

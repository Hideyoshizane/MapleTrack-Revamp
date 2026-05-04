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
				character: { select: { name: true, class: true, level: true } },
				user: { select: { liberationLastUpdate: true } },
			},
		});

		if (!liberationList || liberationList.length === 0) {
			logApiFailure('List not found', { route });

			return createResponse<ApiResponse>({ success: false, message: 'List not found.' }, 200);
		}

		const liberationLastUpdate = liberationList[0].user.liberationLastUpdate;

		const characters: GetLiberationListCharacterResponseBody[] = liberationList.map(
			({ character, user: _, ...rest }): GetLiberationListCharacterResponseBody => ({
				...rest,
				genesisPass: rest.genesisPass ?? undefined,
				liberated: rest.liberated ?? undefined,
				name: character.name,
				class: character.class,
				level: character.level,
			}),
		);

		const responsePayload = { liberationLastUpdate, characters };

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

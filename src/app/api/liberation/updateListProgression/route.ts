import { GENESIS_MIN_LEVEL, DESTINY_MIN_LEVEL } from '@data/liberation/constant';
import { resolveNextLiberationState } from '@data/liberation/liberationQuests';
import { updateLiberationCharacterRequestSchema } from '@features/liberation/schemas/liberation.request.schema';
import { updateLiberationCharacterResponseSchema } from '@features/liberation/schemas/liberation.response.schema';
import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logZodError, logError, logApiFailure } from '@utils/logger';

import type { updateLiberationCharacterResponseBody } from '@features/liberation/schemas/liberation.response.schema';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

const route = 'api/liberation/getLiberationList';

const handler = async (request: NextRequest, authenticatedUserId: string): Promise<NextResponse> => {
	try {
		// Validate request body using Zod
		const parseResult = updateLiberationCharacterRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			logZodError(parseResult.error, { route: route });
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const {
			characterId,
			currentGenesisQuest: requestedGenesisQuest,
			currentGenesisPoints: requestedGenesisPoints,
			currentDestinyQuest: requestedDestinyQuest,
			currentDestinyPoints: requestedDestinyPoints,
			genesisPass,
			liberated,
		} = parseResult.data;

		const existingLiberation = await prisma.liberation.findFirst({
			where: { userId: authenticatedUserId, characterId },
			select: {
				id: true,
				currentGenesisQuest: true,
				currentGenesisPoints: true,
				currentDestinyQuest: true,
				currentDestinyPoints: true,
				liberated: true,
				character: { select: { level: true } },
			},
		});
		if (!existingLiberation) {
			logApiFailure('Character not found.', { route });

			return createResponse<ApiResponse>({ success: false, message: 'Character not found.' }, 200);
		}

		const characterLevel = existingLiberation.character.level;

		const genesisChanged =
			existingLiberation.currentGenesisQuest !== requestedGenesisQuest ||
			existingLiberation.currentGenesisPoints !== requestedGenesisPoints;
		const destinyChanged =
			existingLiberation.currentDestinyQuest !== requestedDestinyQuest ||
			existingLiberation.currentDestinyPoints !== requestedDestinyPoints;

		if (genesisChanged && characterLevel < GENESIS_MIN_LEVEL) {
			logApiFailure('Update blocked: insufficient level for Genesis.', { route });

			return createResponse<ApiResponse>({ success: false, message: 'Update Failed.' }, 200);
		}

		if (destinyChanged && (!existingLiberation.liberated || characterLevel < DESTINY_MIN_LEVEL)) {
			logApiFailure('Update blocked: insufficient level for Destiny.', { route });

			return createResponse<ApiResponse>({ success: false, message: 'Update Failed.' }, 200);
		}

		let nextGenesisQuest = existingLiberation.currentGenesisQuest;
		let nextGenesisPoints = existingLiberation.currentGenesisPoints;
		let nextDestinyQuest = existingLiberation.currentDestinyQuest;
		let nextDestinyPoints = existingLiberation.currentDestinyPoints;
		let nextLiberated = liberated;

		if (genesisChanged) {
			const resolvedGenesisState = resolveNextLiberationState('Genesis', requestedGenesisQuest, requestedGenesisPoints);

			nextGenesisQuest = resolvedGenesisState.questName;
			nextGenesisPoints = resolvedGenesisState.points;
			nextLiberated = resolvedGenesisState.liberated;

			// Unlock Destiny
			if (
				resolvedGenesisState.liberated &&
				resolvedGenesisState.questName === 'Verus Hilla' &&
				resolvedGenesisState.points === 1000
			) {
				nextDestinyQuest = 'Seren';
				nextDestinyPoints = 0;
				nextLiberated = true;
			}
		}

		if (destinyChanged) {
			const resolvedDestinyState = resolveNextLiberationState('Destiny', requestedDestinyQuest, requestedDestinyPoints);

			nextDestinyQuest = resolvedDestinyState.questName;

			nextDestinyPoints = resolvedDestinyState.points;
		}

		const responsePayload: updateLiberationCharacterResponseBody = {
			characterId,
			currentGenesisQuest: nextGenesisQuest,
			currentGenesisPoints: nextGenesisPoints,
			currentDestinyQuest: nextDestinyQuest,
			currentDestinyPoints: nextDestinyPoints,
			liberated: nextLiberated,
			genesisPass,
		};

		const validation = updateLiberationCharacterResponseSchema.safeParse(responsePayload);
		if (!validation.success) {
			logZodError(validation.error, { route });

			throw new Error('Invalid Liberation List data');
		}
		await prisma.liberation.update({
			where: { id: existingLiberation.id },
			data: {
				currentGenesisQuest: nextGenesisQuest,
				currentGenesisPoints: nextGenesisPoints,
				currentDestinyQuest: nextDestinyQuest,
				currentDestinyPoints: nextDestinyPoints,
				genesisPass,
				liberated: nextLiberated,
			},
		});

		// Success response
		return createResponse<ApiResponse<updateLiberationCharacterResponseBody>>(
			{ success: true, message: 'Character Liberation updated successfully.', data: responsePayload },
			200,
		);
	} catch (error) {
		logError(error, { route: route });

		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const POST = routeGuard(handler);

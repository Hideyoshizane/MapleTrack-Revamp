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
			currentGenesisQuest: updateGenesisQuest,
			currentGenesisPoints: updateGenesisPoints,
			genesisPass,
			liberated,
			currentDestinyQuest: updateDestinyQuest,
			currentDestinyPoints: updateDestinyPoints,
		} = parseResult.data;

		const existing = await prisma.liberation.findFirst({
			where: { userId: authenticatedUserId, characterId },
			select: {
				id: true,
				currentDestinyPoints: true,
				currentGenesisPoints: true,
				currentGenesisQuest: true,
				currentDestinyQuest: true,
				liberated: true,
				character: { select: { level: true } },
			},
		});
		if (!existing) {
			logApiFailure('Character not found.', { route });
			return createResponse<ApiResponse>({ success: false, message: 'Character not found.' }, 200);
		}

		const level = existing.character.level;

		const genesisChanged =
			existing.currentGenesisQuest !== updateGenesisQuest || existing.currentGenesisPoints !== updateGenesisPoints;

		const destinyChanged =
			existing.currentDestinyQuest !== updateDestinyQuest || existing.currentDestinyPoints !== updateDestinyPoints;

		if (genesisChanged && level < GENESIS_MIN_LEVEL) {
			logApiFailure('Update blocked: insufficient level for Genesis.', { route });
			return createResponse<ApiResponse>({ success: false, message: 'Update Failed.' }, 200);
		}

		if (destinyChanged && (!existing.liberated || level < DESTINY_MIN_LEVEL)) {
			logApiFailure('Update blocked: insufficient level for Destiny.', { route });
			return createResponse<ApiResponse>({ success: false, message: 'Update Failed.' }, 200);
		}

		let nextGenesisQuest = existing.currentGenesisQuest;
		let nextGenesisPoints = existing.currentGenesisPoints;
		let nextDestinyQuest = existing.currentDestinyQuest;
		let nextDestinyPoints = existing.currentDestinyPoints;
		let nextLiberated = liberated;

		if (genesisChanged) {
			const genesisResolve = resolveNextLiberationState('Genesis', updateGenesisQuest, updateGenesisPoints);

			nextGenesisQuest = genesisResolve.questName;
			nextGenesisPoints = genesisResolve.points;
			nextLiberated = genesisResolve.liberated;

			// Unlock Destiny
			if (
				genesisResolve.liberated === true &&
				genesisResolve.questName === 'Verus Hilla' &&
				genesisResolve.points === 1000
			) {
				nextDestinyQuest = 'Seren';
				nextDestinyPoints = 0;
				nextLiberated = true;
			}
		}

		if (destinyChanged) {
			const destinyResolve = resolveNextLiberationState('Destiny', updateDestinyQuest, updateDestinyPoints);

			nextDestinyQuest = destinyResolve.questName;
			nextDestinyPoints = destinyResolve.points;
		}

		await prisma.liberation.update({
			where: { id: existing.id },
			data: {
				currentGenesisQuest: nextGenesisQuest,
				currentGenesisPoints: nextGenesisPoints,
				currentDestinyQuest: nextDestinyQuest,
				currentDestinyPoints: nextDestinyPoints,
				genesisPass,
				liberated: nextLiberated,
			},
		});

		const responsePayload = {
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

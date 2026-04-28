import { updateLiberationCharacterRequestSchema } from '@features/liberation/schemas/liberation.request.schema';
import { prisma } from '@lib/prisma';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logZodError, logError, logApiFailure } from '@utils/logger';

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

		const { characterId, currentQuest, currentPoints, genesisPass, liberated, type } = parseResult.data;

		const existing = await prisma.liberation.findFirst({
			where: { userId: authenticatedUserId, characterId },
			select: { id: true, character: { select: { level: true } } },
		});

		if (!existing) {
			logApiFailure('Character not found.', { route });
			return createResponse<ApiResponse>({ success: false, message: 'Character not found.' }, 200);
		}

		const level = existing.character.level;

		if (type === 'Genesis') {
			if (level < 255) {
				logApiFailure('Update blocked: insufficient level for Genesis.', { route });
				return createResponse<ApiResponse>({ success: false, message: 'Update Failed.' }, 200);
			}

			if (liberated === true && level < 275) {
				logApiFailure('Update blocked: insufficient level for Destiny.', { route });
				return createResponse<ApiResponse>({ success: false, message: 'Update Failed.' }, 200);
			}
		}

		await prisma.liberation.update({
			where: { id: existing.id },
			data: { currentQuest, currentPoints, genesisPass, liberated, type },
		});

		// Success response
		return createResponse<ApiResponse>({ success: true, message: 'Character Liberation updated sucessfully.' }, 200);
	} catch (error) {
		logError(error, { route: route });
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

export const POST = routeGuard(handler);

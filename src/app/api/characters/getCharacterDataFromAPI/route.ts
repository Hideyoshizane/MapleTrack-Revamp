import { getCharacterDataFromAPIRequestSchema } from '@features/character/schemas/character.request.schema';
import { fetchCharacterDataFromApi } from '@lib/fetchCharacterDataFromApi';
import { routeGuard } from '@lib/security/routeGuard';
import { createResponse } from '@utils/createResponse';
import { logError, logZodError } from '@utils/logger';

import type { getCharacterDataFromAPIResponseBody } from '@features/character/schemas/character.response.schema';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

const route = 'api/characters/getCharacterDataFromAPI';
const handler = async (request: NextRequest): Promise<NextResponse> => {
	const parseResult = getCharacterDataFromAPIRequestSchema.safeParse(await request.json());
	if (!parseResult.success) {
		logZodError(parseResult.error, { route: route });
		return createResponse<ApiResponse>({ success: false, message: 'Invalid parameters.' }, 400);
	}

	const { characterName, server } = parseResult.data;

	try {
		const data = await fetchCharacterDataFromApi(characterName, server);

		return createResponse<ApiResponse<getCharacterDataFromAPIResponseBody>>(
			{ success: true, message: 'Character fetched.', data },
			200,
		);
	} catch (error: unknown) {
		logError(error, { route: route });
		return createResponse<ApiResponse>({ success: false, message: 'Internal server error.' }, 500);
	}
};

export const POST = routeGuard(handler);

import { characterApiSchema } from '@features/character/character.server.schema';
import { fetchCharacterDataFromAPI } from '@lib/fetchCharacterDataFromAPI';
import { createResponse } from '@utils/createResponse';

import type { CharacterDataFromAPI } from '@features/character/characterApi';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
	}

	// Validate name
	const parseResult = characterApiSchema.safeParse(body);
	if (!parseResult.success) {
		return createResponse<ApiResponse>({ success: false, message: 'Invalid parameters.' }, 400);
	}

	const { characterName, server } = parseResult.data;

	try {
		const data = await fetchCharacterDataFromAPI(characterName, server);

		return createResponse<ApiResponse<CharacterDataFromAPI>>(
			{ success: true, message: 'Character fetched.', data },
			200,
		);
	} catch (error: unknown) {
		console.error('Error fetching character:', error);

		return createResponse<ApiResponse>({ success: false, message: 'Internal server error.' }, 500);
	}
};

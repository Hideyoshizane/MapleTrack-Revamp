import { characterNameSchema } from '@features/character/characterNameSchema';
import { fetchCharacterExternal } from '@lib/fetchCharacterExternal';
import { createResponse } from '@utils/createResponse';
import { sanitizeInputBackEnd } from '@utils/sanitizeInputBackEnd';
import { SERVER_OPTIONS } from '@utils/serverCookie';
import { validateField } from '@utils/validateField';

import type { ApiResponse } from '@sharedTypes/api';
import type { CharacterDataFromAPI } from '@sharedTypes/character';
import type { NextResponse, NextRequest } from 'next/server';

export const GET = async (request: NextRequest): Promise<NextResponse> => {
	try {
		// Validate user query parameter
		const characterName = request.nextUrl.searchParams.get('character_name');
		const server = request.nextUrl.searchParams.get('server');

		// Early return if missing
		if (!characterName || !server) {
			return createResponse<ApiResponse>({ success: false, message: 'Missing parameters.' }, 400);
		}

		// Validate name
		const validation = validateField(characterNameSchema, 'name', characterName);
		if (!validation.isValid) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid username.' }, 400);
		}

		// Validate allowed server
		if (!SERVER_OPTIONS.includes(server)) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid server' }, 400);
		}

		// Sanitize inputs
		const sanitizedCharacterName = sanitizeInputBackEnd(characterName);
		const sanitizedServer = sanitizeInputBackEnd(server);

		const data = await fetchCharacterExternal(sanitizedCharacterName, sanitizedServer);
		return createResponse<ApiResponse<CharacterDataFromAPI>>(
			{ success: true, message: 'Character fetched.', data },
			200
		);
	} catch (error: unknown) {
		console.error('Error fetching character:', error);
		return createResponse<ApiResponse>({ success: false, message: 'Internal server error' }, 400);
	}
};

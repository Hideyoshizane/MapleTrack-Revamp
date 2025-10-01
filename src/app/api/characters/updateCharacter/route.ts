import connectToDatabase from '@lib/mongooseConect';
import { Character } from '@models/character';
import { getUpdateCharacterDataRequestSchema } from '@schemas/characterUpdateSchema';
import { createResponse } from '@utils/api/createResponse';
import { SERVER_OPTIONS } from '@utils/cookies/serverCookie';
import { sanitizeInputBackEnd } from '@utils/sanitize/sanitizeInputBackEnd';

import type { CharacterDocument } from '@models/character';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

export const PATCH = async (request: NextRequest): Promise<NextResponse> => {
	try {
		await connectToDatabase();

		// Validate request body using Zod
		const body = await request.json();
		if (!body?.data) return createResponse<ApiResponse>({ success: false, error: 'Missing request data' }, 400);
		delete body.data._id;

		const parseResult = getUpdateCharacterDataRequestSchema.safeParse(body);
		if (!parseResult.success)
			return createResponse<ApiResponse>({ success: false, error: 'Invalid request body' }, 400);

		const { userOrigin, server: serverRaw, code: codeRaw, data } = parseResult.data;

		// Sanitize inputs
		const username = sanitizeInputBackEnd(userOrigin);
		const server = sanitizeInputBackEnd(serverRaw);
		const code = sanitizeInputBackEnd(codeRaw);
		const characterName = sanitizeInputBackEnd(data.name);

		if (!username || !server || !code || !characterName) {
			return createResponse<ApiResponse>({ success: false, error: 'Missing required fields' }, 400);
		}

		// Validate allowed server
		if (!SERVER_OPTIONS.includes(server)) {
			return createResponse<ApiResponse>({ success: false, error: 'Invalid server' }, 400);
		}

		// Fetch existing character
		let character: CharacterDocument | null = await Character.findOne({ userOrigin: username, server, code }).exec();
		if (!character) {
			// Create new character
			character = new Character({
				...data,
				userOrigin: username,
				server,
				code,
			});
		} else {
			Object.assign(character, {
				...data,
			});
		}
		// If character bossing is true add to BossList
		// To be added

		await character.save();
		return createResponse<ApiResponse>({ success: true, message: 'Character updated successfully.' }, 200);
	} catch (error) {
		console.error('Search error:', error);
		return createResponse<ApiResponse>({ success: false, error: 'Internal Server Error' }, 500);
	}
};

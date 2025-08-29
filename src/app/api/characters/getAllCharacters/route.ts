import { NextRequest } from 'next/server';

import { GetAllCharactersRequestBody } from '@/shared/types/character';
import connectToDatabase from '@lib/mongooseConect';
import { Character } from '@models/character';
import { createResponse } from '@utils/api/createResponse';
import { SERVER_OPTIONS } from '@utils/cookies/serverCookie';
import { isString } from '@utils/guards/isString';
import { sanitizeInputBackEnd } from '@utils/sanitize/sanitizeInputBackEnd';

export async function POST(req: NextRequest) {
	try {
		await connectToDatabase();

		let rawBody: unknown;

		// Parse JSON body and fail early if malformed
		try {
			rawBody = await req.json();
		} catch {
			return createResponse({ success: false, error: 'Invalid JSON payload' }, 400);
		}

		// Assert rawBody shape as GetAllCharactersRequestBody
		const body = rawBody as GetAllCharactersRequestBody;

		// Validate that the properties are strings
		if (!isString(body.username) || !isString(body.server)) {
			return createResponse({ success: false, error: 'Invalid request body' }, 400);
		}

		// Validate allowed server
		if (!SERVER_OPTIONS.includes(body.server)) {
			return createResponse({ success: false, error: 'Invalid server' }, 400);
		}

		// Sanitize inputs
		const username = sanitizeInputBackEnd(body.username);
		const server = sanitizeInputBackEnd(body.server);

		if (!username || !server) {
			return createResponse({ success: false, error: 'Missing required fields' }, 400);
		}

		// Query characters by userOrigin and server
		const characters = await Character.find({ userOrigin: username, server: server }).exec();

		if (!characters.length) {
			return createResponse({ success: true, message: 'No characters found' }, 200);
		}

		// Success response with data

		return createResponse(
			{
				success: true,
				message: 'Characters returned.',
				data: characters,
			},
			200
		);
	} catch (error) {
		console.error('Search error:', error);
		return createResponse({ success: false, error: 'Internal Server Error' }, 500);
	}
}

import { NextRequest } from 'next/server';

import connectToDatabase from '@lib/mongooseConect';
import { Character } from '@models/character';
import { getAllCharactersRequestSchema } from '@schemas/characterRequestSchema';
import { ApiResponse } from '@sharedTypes/api/api';
import { createResponse } from '@utils/api/createResponse';
import { SERVER_OPTIONS } from '@utils/cookies/serverCookie';
import { sanitizeInputBackEnd } from '@utils/sanitize/sanitizeInputBackEnd';

export async function POST(req: NextRequest) {
	try {
		await connectToDatabase();

		// Parse JSON body
		let rawBody: unknown;
		try {
			rawBody = await req.json();
		} catch {
			return createResponse<ApiResponse>({ success: false, error: 'Invalid JSON payload' }, 400);
		}

		// Validate request body using Zod
		const parseResult = getAllCharactersRequestSchema.safeParse(rawBody);
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, error: 'Invalid request body' }, 400);
		}

		const { username: rawUsername, server: rawServer } = parseResult.data;

		// Sanitize inputs
		const username = sanitizeInputBackEnd(rawUsername);
		const server = sanitizeInputBackEnd(rawServer);
		if (!username || !server) {
			return createResponse<ApiResponse>({ success: false, error: 'Missing required fields' }, 400);
		}

		// Validate allowed server
		if (!SERVER_OPTIONS.includes(server)) {
			return createResponse<ApiResponse>({ success: false, error: 'Invalid server' }, 400);
		}

		// Query characters by userOrigin and server
		const characters = await Character.find({ userOrigin: username, server: server }).exec();

		const response: ApiResponse<typeof characters> = {
			success: true,
			message: characters.length ? 'Characters returned.' : 'No characters found.',
			data: characters.length ? characters : undefined,
		};

		return createResponse(response, 200);
	} catch (error) {
		console.error('Search error:', error);
		return createResponse<ApiResponse>({ success: false, error: 'Internal Server Error' }, 500);
	}
}

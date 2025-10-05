import connectToDatabase from '@lib/mongooseConect';
import { Character } from '@models/character';
import { getAllCharactersRequestSchema } from '@schemas/characterRequestSchema';
import { createResponse } from '@utils/api/createResponse';
import { SERVER_OPTIONS } from '@utils/cookies/serverCookie';
import { sanitizeInputBackEnd } from '@utils/sanitize/sanitizeInputBackEnd';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		await connectToDatabase();

		// Validate request body using Zod
		const parseResult = getAllCharactersRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, error: 'Invalid request body' }, 400);
		}

		// Sanitize inputs
		const [username, server] = [parseResult.data.username, parseResult.data.server].map(sanitizeInputBackEnd);
		if (!username || !server) {
			return createResponse<ApiResponse>({ success: false, error: 'Missing required fields' }, 400);
		}

		// Validate allowed server
		if (!SERVER_OPTIONS.includes(server)) {
			return createResponse<ApiResponse>({ success: false, error: 'Invalid server' }, 400);
		}

		// Query characters by userOrigin and server
		const characters = await Character.find({ userOrigin: username, server: server }).lean().exec();

		return createResponse<ApiResponse<typeof characters>>(
			{
				success: true,
				message: characters.length ? 'Characters returned.' : 'No characters found.',
				data: characters.length ? characters : undefined,
			},
			200
		);
	} catch (error) {
		console.error('Search error:', error);
		return createResponse<ApiResponse>({ success: false, error: 'Internal Server Error' }, 500);
	}
};

import connectToDatabase from '@lib/mongooseConect';
import { BossList } from '@models/bossList';
import { BossListRequestSchema } from '@schemas/bossListSchema';
import { createResponse } from '@utils/api/createResponse';
import { SERVER_OPTIONS } from '@utils/cookies/serverCookie';
import { sanitizeInputBackEnd } from '@utils/sanitize/sanitizeInputBackEnd';

import type { ApiResponse } from '@sharedTypes/api';
import type { PostBossListApiResponse } from '@sharedTypes/bossList';
import type { NextResponse, NextRequest } from 'next/server';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		await connectToDatabase();

		// Validate request body using Zod
		const parseResult = BossListRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, error: 'Invalid request body' }, 400);
		}

		const { userOrigin, server: rawServer } = parseResult.data;

		// Sanitize inputs
		const [username, server] = [userOrigin, rawServer].map(sanitizeInputBackEnd);
		if (!username || !server) {
			return createResponse<ApiResponse>({ success: false, error: 'Missing required fields' }, 400);
		}

		// Validate allowed server
		if (!SERVER_OPTIONS.includes(server)) {
			return createResponse<ApiResponse>({ success: false, error: 'Invalid server' }, 400);
		}

		// Query BossList and return only the requested server
		const bossList = await BossList.findOne({ userOrigin: username, 'server.name': server }).lean().exec();

		if (!bossList) {
			return createResponse<ApiResponse>({ success: false, error: 'Boss List not found.' }, 400);
		}
		// Extract the requested server
		const serverData = bossList.server.find((s): boolean => s.name === server);
		if (!serverData) {
			return createResponse<ApiResponse>({ success: false, error: 'Server not found in Boss List.' }, 404);
		}

		// Success response
		return createResponse<PostBossListApiResponse>(
			{
				success: true,
				message: 'Boss List found.',
				data: serverData,
			},
			200
		);
	} catch (error) {
		console.error('Search error:', error);
		return createResponse<ApiResponse>({ success: false, error: 'Internal Server Error' }, 500);
	}
};

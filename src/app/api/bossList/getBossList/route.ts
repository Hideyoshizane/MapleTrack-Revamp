import { BossList } from '@features/Boss/bossListModel';
import { BossListRequestSchema } from '@features/Boss/bossListSchema';
import connectToDatabase from '@lib/mongooseConect';
import { createResponse } from '@utils/createResponse';
import { sanitizeInputBackEnd } from '@utils/sanitizeInputBackEnd';
import { SERVER_OPTIONS } from '@utils/serverCookie';

import type { ApiResponse } from '@sharedTypes/api';
import type { PostBossListApiResponse } from '@sharedTypes/bossList';
import type { NextResponse, NextRequest } from 'next/server';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		await connectToDatabase();

		// Validate request body using Zod
		const parseResult = BossListRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const { userOrigin, server: rawServer } = parseResult.data;

		// Sanitize inputs
		const [username, server] = [userOrigin, rawServer].map(sanitizeInputBackEnd);
		if (!username || !server) {
			return createResponse<ApiResponse>({ success: false, message: 'Missing required fields' }, 400);
		}

		// Validate allowed server
		if (!SERVER_OPTIONS.includes(server)) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid server' }, 400);
		}

		// Query BossList and return only the requested server
		const bossList = await BossList.findOne({ userOrigin: username, 'server.name': server }).lean().exec();

		if (!bossList) {
			return createResponse<ApiResponse>({ success: false, message: 'Boss List not found.' }, 400);
		}
		// Extract the requested server
		const serverData = bossList.server.find((s): boolean => s.name === server);
		if (!serverData) {
			return createResponse<ApiResponse>({ success: false, message: 'Server not found in Boss List.' }, 404);
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
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

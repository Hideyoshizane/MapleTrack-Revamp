import { getToken } from 'next-auth/jwt';

import { getAllCharactersRequestSchema } from '@features/character/characterRequestSchema';
import { prisma } from '@lib/prisma';
import { createResponse } from '@utils/createResponse';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		// Extract token from the request cookies
		const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
		if (!token || typeof token.id !== 'string') {
			return createResponse<ApiResponse>({ success: false, message: 'Unauthorized' }, 401);
		}

		const authenticatedUserId = token.id;

		let requestBody: unknown;
		try {
			requestBody = await request.json();
		} catch {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid JSON body' }, 400);
		}

		// Validate request body using Zod
		const parseResult = getAllCharactersRequestSchema.safeParse(requestBody);
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}
		const { server } = parseResult.data;

		// Query characters by userOrigin and server
		const characters = await prisma.character.findMany({
			where: {
				userId: authenticatedUserId,
				server,
			},
			select: {
				id: true,
				name: true,
				server: true,
				symbols: {
					select: {
						id: true,
						content: true,
					},
				},
			},
		});

		return createResponse<ApiResponse<typeof characters>>(
			{
				success: true,
				message: characters.length ? 'Characters returned.' : 'No characters found.',
				data: characters,
			},
			200,
		);
	} catch (error) {
		console.error('character_fetch_failed', {
			error: error instanceof Error ? error.message : 'unknown',
		});
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

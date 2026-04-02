import { getToken } from 'next-auth/jwt';

import { getClassByName } from '@data/classes/classes';
import { getCharacterDataRequestSchema } from '@features/character/characterRequestSchema';
import { generateCharacterObject } from '@features/character/characterService';
import { syncCharacterInfo } from '@lib/characters';
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

		let body: unknown;
		try {
			body = await request.json();
		} catch {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		// Validate request body using Zod
		const parseResult = getCharacterDataRequestSchema.safeParse(body);
		if (!parseResult.success) {
			console.log('hi');
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const { server, className } = parseResult.data;

		await syncCharacterInfo({ authenticatedUserId, server, className });

		// Search for the character
		const character = await prisma.character.findUnique({
			where: {
				userId_server_class: {
					userId: authenticatedUserId,
					server,
					class: className,
				},
			},
			select: {
				name: true,
				level: true,
				targetLevel: true,
				class: true,
				jobType: true,
				legion: true,
				linkSkill: true,
				bossing: true,
				syncing: true,
				server: true,
				symbols: {
					select: {
						name: true,
						level: true,
						exp: true,
						category: true,
						content: {
							select: {
								contentType: true,
								checked: true,
								cleared: true,
								date: true,
								tries: true,
							},
						},
					},
				},
			},
		});

		//if not in database, return a generic object.
		if (!character) {
			const classData = getClassByName(className);
			if (!classData) {
				return createResponse<ApiResponse>({ success: false, message: `Class with name ${className} not found` }, 404);
			}

			const genericCharacter = generateCharacterObject({
				jobClassName: classData.className,
				jobType: classData.jobType,
				legion: classData.legionType,
				linkSkill: classData.linkSkill,
				server: server,
			});

			return createResponse<ApiResponse<typeof genericCharacter>>(
				{ success: true, message: 'Character not found, returning new Character.', data: genericCharacter },
				200,
			);
		}

		return createResponse<ApiResponse<typeof character>>(
			{ success: true, message: 'Found character.', data: character },
			200,
		);
	} catch (error) {
		console.error('Search error:', error);
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

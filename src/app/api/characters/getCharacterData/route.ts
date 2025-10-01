import { JobClasses } from '@data/classes/classes';
import connectToDatabase from '@lib/mongooseConect';
import { Character } from '@models/character';
import { getCharacterDataRequestSchema } from '@schemas/characterRequestSchema';
import { generateCharacterObject } from '@service/characterService';
import { createResponse } from '@utils/api/createResponse';
import { SERVER_OPTIONS } from '@utils/cookies/serverCookie';
import { sanitizeInputBackEnd } from '@utils/sanitize/sanitizeInputBackEnd';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		await connectToDatabase();

		// Validate request body using Zod
		const parseResult = getCharacterDataRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, error: 'Invalid request body' }, 400);
		}

		const { userOrigin: rawUserOrigin, server: rawServer, code: rawCode } = parseResult.data;

		// Sanitize inputs
		const username = sanitizeInputBackEnd(rawUserOrigin);
		const server = sanitizeInputBackEnd(rawServer);
		const code = sanitizeInputBackEnd(rawCode);
		if (!username || !server || !code) {
			return createResponse<ApiResponse>({ success: false, error: 'Missing required fields' }, 400);
		}

		// Validate allowed server
		if (!SERVER_OPTIONS.includes(server)) {
			return createResponse<ApiResponse>({ success: false, error: 'Invalid server' }, 400);
		}

		// Search for the character
		const character = await Character.findOne({
			userOrigin: username,
			server,
			code,
		})
			.lean()
			.exec();

		//if not in database, return a generic object.
		if (!character) {
			const job = JobClasses.find((job): boolean => job.code === code);

			if (!job) {
				return createResponse<ApiResponse>({ success: false, error: `Job with code ${code} not found` }, 404);
			}

			const genericCharacter = generateCharacterObject({
				jobClassName: job.className,
				jobType: job.jobType,
				legion: job.legionType,
				code: job.code,
				linkSkill: job.linkSkill,
				server: server,
				userOrigin: username,
			});
			return createResponse<ApiResponse<typeof genericCharacter>>(
				{ success: true, message: 'Character not found, returning new Character.', data: genericCharacter },
				200
			);
		}

		// Success response
		return createResponse<ApiResponse<typeof character>>(
			{ success: true, message: 'Found character.', data: character },
			200
		);
	} catch (error) {
		console.error('Search error:', error);
		return createResponse<ApiResponse>({ success: false, error: 'Internal Server Error' }, 500);
	}
};

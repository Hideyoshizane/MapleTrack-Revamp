import { NextRequest } from 'next/server';

import { JobClasses } from '@data/classes/classes';
import connectToDatabase from '@lib/mongooseConect';
import { Character } from '@models/character';
import { getCharacterDataRequestSchema } from '@schemas/characterRequestSchema';
import { generateCharacterObject } from '@service/characterService';
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
		const parseResult = getCharacterDataRequestSchema.safeParse(rawBody);
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
		});

		//if not in database, return a generic object.
		if (!character) {
			const job = JobClasses.find((job) => job.code === code);

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
				{ success: true, message: 'Character not found, returning generic object', data: genericCharacter },
				200
			);
		}

		// Success response
		return createResponse<ApiResponse<typeof character>>(
			{ success: true, message: 'Found character', data: character },
			200
		);
	} catch (error) {
		console.error('Search error:', error);
		return createResponse<ApiResponse>({ success: false, error: 'Internal Server Error' }, 500);
	}
}

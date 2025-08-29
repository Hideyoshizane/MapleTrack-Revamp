import { NextRequest } from 'next/server';

import { GetCharacterDataRequestBody } from '@/shared/types/character';
import { JobClasses } from '@data/classes/classes';
import connectToDatabase from '@lib/mongooseConect';
import { Character } from '@models/character';
import { generateCharacterObject } from '@service/characterService';
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
		const body = rawBody as GetCharacterDataRequestBody;

		// Validate that the properties are strings
		if (!isString(body.userOrigin) || !isString(body.server) || !isString(body.code)) {
			return createResponse({ success: false, error: 'Invalid request body' }, 400);
		}

		// Validate allowed server
		if (!SERVER_OPTIONS.includes(body.server)) {
			return createResponse({ success: false, error: 'Invalid server' }, 400);
		}

		// Sanitize inputs
		const username = sanitizeInputBackEnd(body.userOrigin);
		const server = sanitizeInputBackEnd(body.server);
		const code = sanitizeInputBackEnd(body.code);

		if (!username || !server || !code) {
			return createResponse({ success: false, error: 'Missing required fields' }, 400);
		}

		// Search for the character
		const character = await Character.findOne({
			userOrigin: username,
			server: server,
			code: code,
		});
		//if not in database, return a generic object.
		if (!character) {
			const job = JobClasses.find((job) => job.code === code);

			if (!job) {
				throw new Error(`Job with code ${code} not found`);
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
			return createResponse({ success: true, message: 'Character not found', data: genericCharacter }, 404);
		}

		// Success response with data

		return createResponse(
			{
				success: true,
				message: 'Found character.',
				data: character,
			},
			200
		);
	} catch (error) {
		console.error('Search error:', error);
		return createResponse({ success: false, error: 'Internal Server Error' }, 500);
	}
}

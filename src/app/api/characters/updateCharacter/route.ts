import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { getToken } from 'next-auth/jwt';

import { characterToBossList } from '@features/Boss/bossListService';
import { getUpdateCharacterDataRequestSchema } from '@features/character/characterUpdateSchema';
import { prisma } from '@lib/prisma';
import { createResponse } from '@utils/createResponse';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

dayjs.extend(utc);

export const PATCH = async (request: NextRequest): Promise<NextResponse> => {
	try {
		// Extract token from the request cookies
		const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
		if (!token || typeof token.id !== 'string') {
			return createResponse<ApiResponse>({ success: false, message: 'Unauthorized' }, 401);
		}

		let body: unknown;
		try {
			body = await request.json();
		} catch {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		// Validate request body using Zod
		const parseResult = getUpdateCharacterDataRequestSchema.safeParse(body);
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const { server, code, data } = parseResult.data;
		const authenticatedUserId = token.id;
		const now = dayjs().utc().toDate();

		await prisma.$transaction(async (tx) => {
			const character = await tx.character.upsert({
				where: {
					userId_server_code: {
						userId: authenticatedUserId,
						server,
						code,
					},
				},
				create: {
					name: data.name,
					level: data.level,
					targetLevel: data.targetLevel,
					class: data.class,
					jobType: data.jobType,
					legion: data.legion,
					linkSkill: data.linkSkill,
					bossing: data.bossing,
					syncing: data.syncing,
					userId: authenticatedUserId,
					server,
					code,
					lastUpdate: now,
				},
				update: {
					name: data.name,
					level: data.level,
					targetLevel: data.targetLevel,
					class: data.class,
					jobType: data.jobType,
					legion: data.legion,
					linkSkill: data.linkSkill,
					bossing: data.bossing,
					syncing: data.syncing,
					lastUpdate: now,
				},
			});

			for (const symbol of data.symbols) {
				const symbolRecord = await tx.characterSymbol.upsert({
					where: {
						characterId_name: {
							characterId: character.id,
							name: symbol.name,
						},
					},
					create: {
						name: symbol.name,
						level: symbol.level,
						exp: symbol.exp,
						category: symbol.category,
						characterId: character.id,
					},
					update: {
						level: symbol.level,
						exp: symbol.exp,
						category: symbol.category,
					},
				});

				for (const content of symbol.content) {
					await tx.characterContent.upsert({
						where: {
							symbolId_contentType: {
								symbolId: symbolRecord.id,
								contentType: content.contentType,
							},
						},
						create: {
							contentType: content.contentType,
							checked: content.checked,
							tries: content.tries ?? null,
							symbolId: symbolRecord.id,
						},
						update: {
							checked: content.checked,
							tries: content.tries ?? null,
						},
					});
				}
			}
		});

		await characterToBossList(authenticatedUserId, server, data.name, code, data.class, data.level, data.bossing);

		return createResponse<ApiResponse>({ success: true, message: 'Character updated successfully.' }, 200);
	} catch (error) {
		console.error('Search error:', error);
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

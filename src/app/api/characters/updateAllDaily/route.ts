import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { getToken } from 'next-auth/jwt';

import {
	getContentValue,
	calculateNewLevelFromExp,
	canUseSymbol,
	getSymbolMaxLevel,
	isSymbolName,
	toSymbolName,
} from '@data/symbols/symbolMappings';
import { updateAllDailySchema } from '@features/character/characterUpdateSchema';
import { prisma } from '@lib/prisma';
import { createResponse } from '@utils/createResponse';

import type { LevelUpResult } from '@data/symbols/symbolMappings';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextResponse, NextRequest } from 'next/server';

dayjs.extend(utc);

const DAILY_CONTENT_TYPE = 'Daily Quest' as const;

export const POST = async (request: NextRequest): Promise<NextResponse> => {
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
		const parseResult = updateAllDailySchema.safeParse(body);
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}
		const { server, code, arcaneBonus, sacredBonus } = parseResult.data;
		const authenticatedUserId = token.id;
		const now = dayjs().utc().toDate();

		// Search for the character and update
		const updatedResults = await prisma.$transaction(async (tx) => {
			const character = await tx.character.findUnique({
				where: {
					userId_server_code: {
						userId: authenticatedUserId,
						server,
						code,
					},
				},
				include: {
					symbols: {
						include: { content: true },
					},
				},
			});

			if (!character) {
				return null;
			}

			const results: Record<string, LevelUpResult> = {};
			const symbolUpdates: Parameters<typeof tx.characterSymbol.update>[0][] = [];
			const contentUpdates: Parameters<typeof tx.characterContent.update>[0][] = [];

			// Helper to process symbol array
			const processCategory = (category: 'arcane' | 'sacred' | 'grand', bonus: number): void => {
				const symbols = character.symbols.filter((symbol): boolean => symbol.category === category);

				for (const symbol of symbols) {
					if (!isSymbolName(symbol.name)) {
						continue;
					}
					if (!canUseSymbol(character.level, symbol.name)) {
						continue;
					}

					const maxLevel = getSymbolMaxLevel(symbol.category);
					if (symbol.level >= maxLevel) {
						continue;
					}

					const dailyContent = symbol.content.find((content): boolean => content.contentType === DAILY_CONTENT_TYPE);
					if (!dailyContent) {
						continue;
					}
					if (dailyContent.cleared || dailyContent.checked !== true) {
						continue;
					}

					let dailyValue = getContentValue(symbol.name, DAILY_CONTENT_TYPE);

					const bonusContent = symbol.content.find(
						(content): boolean =>
							content.checked === true && content.contentType !== DAILY_CONTENT_TYPE && content.tries === null,
					);

					if (bonusContent) {
						const bonusSymbol = toSymbolName(bonusContent.contentType);
						if (bonusSymbol) {
							dailyValue += getContentValue(bonusSymbol, DAILY_CONTENT_TYPE);
						}
					}

					dailyValue += bonus;

					const updatedExp = symbol.exp + dailyValue;
					const newValues = calculateNewLevelFromExp(symbol.category, symbol.level, updatedExp);

					symbolUpdates.push({
						where: { id: symbol.id },
						data: {
							level: newValues.currentLevel,
							exp: newValues.currentExp,
						},
					});

					contentUpdates.push({
						where: {
							symbolId_contentType: {
								symbolId: symbol.id,
								contentType: dailyContent.contentType,
							},
						},
						data: {
							cleared: true,
							date: now,
						},
					});

					results[symbol.name] = newValues;
				}
			};

			processCategory('arcane', arcaneBonus ?? 0);
			processCategory('sacred', sacredBonus ?? 0);
			processCategory('grand', sacredBonus ?? 0);

			await Promise.all([
				...symbolUpdates.map((args) => tx.characterSymbol.update(args)),
				...contentUpdates.map((args) => tx.characterContent.update(args)),
			]);

			return results;
		});

		if (!updatedResults) {
			return createResponse<ApiResponse>(
				{
					success: true,
					message: 'Character not found.',
				},
				200,
			);
		}

		return createResponse<ApiResponse<Record<string, LevelUpResult>>>(
			{
				success: true,
				message: 'Character updated successfully.',
				data: updatedResults,
			},
			200,
		);
	} catch (error) {
		console.error('Search error:', error);
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};

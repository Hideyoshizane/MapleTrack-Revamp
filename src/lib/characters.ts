import { DEFAULT_WEEKLY_TRIES } from '@data/character/constants';
import { updateCharacterLevelFromBossList } from '@features/Boss/bossListService';
import { prisma } from '@lib/prisma';
import { sanitizeInputBackEnd } from '@utils/sanitizeInputBackEnd';
import { type ServerOption } from '@utils/serverCookie';
import { hasWeeklyResetOccurred, hasDailyResetOccurred } from '@utils/time';

import { fetchCharacterDataFromAPI } from './fetchCharacterDataFromAPI';

import type { Prisma } from '@prisma/client';

const sanitizeString = (input: unknown): string | null => {
	if (typeof input !== 'string') {
		return null;
	}

	return sanitizeInputBackEnd(input) || null;
};

export const validateUserAccess = (
	params: { userOrigin: string; server: string; code: string },
	sessionUsername: string,
): boolean => {
	try {
		// Validate that the properties are strings
		const username = sanitizeString(sessionUsername);
		const userOrigin = sanitizeString(params.userOrigin);
		const server = sanitizeString(params.server);
		const code = sanitizeString(params.code);

		return !!username && !!userOrigin && !!server && !!code && isValidServerName(server) && username === userOrigin;
	} catch (error) {
		console.error('User validation error:', error);
		return false;
	}
};

const getArcaneSymbol = async (
	tx: Prisma.TransactionClient,
	characterId: string,
	name: string,
): Promise<{ id: string }> => {
	const symbol = await tx.characterSymbol.findFirst({
		where: {
			characterId,
			name,
			category: 'arcane',
		},
		select: { id: true },
	});

	if (!symbol) {
		throw new Error(`${name} symbol not found`);
	}

	return symbol;
};

const resetDailyQuests = async (tx: Prisma.TransactionClient, characterId: string): Promise<void> => {
	const symbols = await tx.characterSymbol.findMany({
		where: { characterId },
		select: { id: true },
	});

	if (!symbols.length) {
		return;
	}

	const symbolIds = symbols.map((symbol) => symbol.id);

	const quests = await tx.characterContent.findMany({
		where: {
			symbolId: { in: symbolIds },
			contentType: 'Daily Quest',
		},
		select: { id: true, date: true },
	});

	const questsToReset = quests.filter((quest) => hasDailyResetOccurred(quest.date)).map((quest) => quest.id);

	if (!questsToReset.length) {
		return;
	}

	await tx.characterContent.updateMany({
		where: { id: { in: questsToReset } },
		data: { cleared: false },
	});
};

const resetWeeklyQuests = async (tx: Prisma.TransactionClient, characterId: string): Promise<void> => {
	const symbols = await tx.characterSymbol.findMany({
		where: { characterId },
		select: { id: true },
	});

	if (!symbols.length) {
		return;
	}

	const symbolIds = symbols.map((symbol) => symbol.id);

	const quests = await tx.characterContent.findMany({
		where: {
			symbolId: { in: symbolIds },
			tries: { not: null },
		},
		select: { id: true, date: true },
	});

	const questsToReset = quests.filter((quest) => hasWeeklyResetOccurred(quest.date)).map((quest) => quest.id);
	if (!questsToReset.length) {
		return;
	}

	await tx.characterContent.updateMany({
		where: { id: { in: questsToReset } },
		data: {
			tries: DEFAULT_WEEKLY_TRIES,
			cleared: false,
		},
	});
};

type syncCharacterInfoParams = {
	authenticatedUserId: string;
	server: ServerOption;
	code: string;
};
export const syncCharacterInfo = async ({
	authenticatedUserId,
	server,
	code,
}: syncCharacterInfoParams): Promise<void> => {
	// Validate that the properties are strings
	const cleanUserId = sanitizeString(authenticatedUserId);
	const cleanServer = sanitizeString(server);
	const cleanCode = sanitizeString(code);

	if (!cleanUserId || !cleanServer || !cleanCode) {
		return;
	}

	await prisma.$transaction(async (tx) => {
		const character = await tx.character.findFirst({
			where: { userId: cleanUserId, server: cleanServer, code: cleanCode },
			select: {
				id: true,
				name: true,
				level: true,
				syncing: true,
			},
		});

		if (!character || !character.syncing) {
			return;
		}

		const externalData = await fetchCharacterDataFromAPI(character.name, server);

		if (externalData.level > character.level) {
			await tx.character.update({
				where: { id: character.id },
				data: { level: externalData.level },
			});

			if (externalData.level > 205) {
				const symbol = await getArcaneSymbol(tx, character.id, 'Vanishing Journey');

				await tx.characterContent.update({
					where: {
						symbolId_contentType: {
							symbolId: symbol.id,
							contentType: 'Reverse City',
						},
					},
					data: { checked: true },
				});
			}

			if (externalData.level > 215) {
				const symbol = await getArcaneSymbol(tx, character.id, 'Chu Chu Island');

				await tx.characterContent.update({
					where: {
						symbolId_contentType: {
							symbolId: symbol.id,
							contentType: 'Yum Yum Island',
						},
					},
					data: { checked: true },
				});
			}

			await updateCharacterLevelFromBossList(cleanUserId, server, code, externalData.level);
		}

		await resetDailyQuests(tx, character.id);
		await resetWeeklyQuests(tx, character.id);
	});
};

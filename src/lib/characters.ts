import { DEFAULT_WEEKLY_TRIES } from '@data/character/constants';
import { prisma } from '@lib/prisma';
import { sanitizeInput } from '@utils/sanitizeInput';
import { hasWeeklyResetOccurred, hasDailyResetOccurred } from '@utils/time';

import { fetchCharacterDataFromApi } from './fetchCharacterDataFromApi';

import type { getCharacterDataFromAPIResponseBody } from '@features/character/schemas/character.response.schema';
import type { Prisma } from '@prisma/client';
import type { ServerOption } from '@utils/serverCookie';

const sanitizeString = (input: unknown): string | null => {
	if (typeof input !== 'string') {
		return null;
	}

	return sanitizeInput(input) || null;
};

const getSymbolIds = async (tx: Prisma.TransactionClient, characterId: string): Promise<string[]> => {
	const symbols = await tx.characterSymbol.findMany({
		where: { characterId },
		select: { id: true },
	});

	return symbols.map((s) => s.id);
};

const resetDailyQuests = async (tx: Prisma.TransactionClient, symbolIds: string[]): Promise<void> => {
	if (!symbolIds.length) {
		return;
	}

	const quests = await tx.characterContent.findMany({
		where: { symbolId: { in: symbolIds }, contentType: 'Daily Quest' },
		select: { id: true, date: true },
	});

	const questsToReset = quests.filter((quest) => hasDailyResetOccurred(quest.date)).map((quest) => quest.id);
	if (!questsToReset.length) {
		return;
	}

	await tx.characterContent.updateMany({ where: { id: { in: questsToReset } }, data: { cleared: false } });
};

const resetWeeklyQuests = async (tx: Prisma.TransactionClient, symbolIds: string[]): Promise<void> => {
	if (!symbolIds.length) {
		return;
	}

	const quests = await tx.characterContent.findMany({
		where: { symbolId: { in: symbolIds }, tries: { not: null } },
		select: { id: true, date: true },
	});

	const questsToReset = quests.filter((quest) => hasWeeklyResetOccurred(quest.date)).map((quest) => quest.id);
	if (!questsToReset.length) {
		return;
	}

	await tx.characterContent.updateMany({
		where: { id: { in: questsToReset } },
		data: { tries: DEFAULT_WEEKLY_TRIES, cleared: false },
	});
};

type syncCharacterInfoParams = {
	authenticatedUserId: string;
	server: ServerOption;
	className: string;
};
export const syncCharacterInfo = async ({
	authenticatedUserId,
	server,
	className,
}: syncCharacterInfoParams): Promise<void> => {
	// Validate that the properties are strings
	const cleanUserId = sanitizeString(authenticatedUserId);
	const cleanServer = sanitizeString(server);
	const cleanCode = sanitizeString(className);
	if (!cleanUserId || !cleanServer || !cleanCode) {
		return;
	}

	const character = await prisma.character.findFirst({
		where: { userId: cleanUserId, server: cleanServer, class: cleanCode },
		select: { id: true, name: true, level: true, syncing: true },
	});
	if (!character) {
		return;
	}

	let externalData: getCharacterDataFromAPIResponseBody;
	if (character.syncing) {
		externalData = await fetchCharacterDataFromApi(character.name, cleanServer);
	}

	await prisma.$transaction(async (tx): Promise<void> => {
		const symbolIds = await getSymbolIds(tx, character.id);

		if (externalData && externalData.level > character.level) {
			await tx.character.update({ where: { id: character.id }, data: { level: externalData.level } });

			const unlockSymbolContent = async (symbolName: string, contentType: string): Promise<void> => {
				const symbol = await tx.characterSymbol.findFirst({
					where: { characterId: character.id, name: symbolName, category: 'arcane' },
					select: { id: true },
				});
				if (!symbol) {
					return;
				}

				await tx.characterContent.update({
					where: { symbolId_contentType: { symbolId: symbol.id, contentType } },
					data: { checked: true },
				});
			};

			if (externalData.level > 205) {
				await unlockSymbolContent('Vanishing Journey', 'Reverse City');
			}

			if (externalData.level > 215) {
				await unlockSymbolContent('Chu Chu Island', 'Yum Yum Island');
			}
		}

		await resetDailyQuests(tx, symbolIds);
		await resetWeeklyQuests(tx, symbolIds);
	});
};

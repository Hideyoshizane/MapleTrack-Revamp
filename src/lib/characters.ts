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

type SyncCharacterInfoParams = {
	authenticatedUserId: string;
	server: ServerOption;
	className: string;
};

const unlockArcaneContent = async (
	tx: Prisma.TransactionClient,
	characterId: string,
	symbolName: string,
	contentType: string,
): Promise<void> => {
	const symbol = await tx.characterSymbol.findFirst({
		where: { characterId, name: symbolName, category: 'arcane' },
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
export const syncCharacterInfo = async ({
	authenticatedUserId,
	server,
	className,
}: SyncCharacterInfoParams): Promise<void> => {
	// Validate that the properties are strings
	const cleanUserId = sanitizeString(authenticatedUserId);
	const cleanServer = sanitizeString(server);
	const cleanCode = sanitizeString(className);
	if (!cleanUserId || !cleanServer || !cleanCode) {
		return;
	}

	const character = await prisma.character.findFirst({
		where: { userId: cleanUserId, server: cleanServer, class: cleanCode },
		select: { id: true, name: true, level: true, syncing: true, lastSymbolDaily: true },
	});
	if (!character) {
		return;
	}

	const externalDataPromise: Promise<getCharacterDataFromAPIResponseBody> | null = character.syncing
		? fetchCharacterDataFromApi(character.name, cleanServer)
		: null;

	await prisma.$transaction(async (tx): Promise<void> => {
		const symbolData = await tx.characterSymbol.findMany({
			where: { characterId: character.id },
			select: { id: true, contents: { select: { id: true, contentType: true, date: true, tries: true } } },
		});

		const dailyQuestIdsToReset: string[] = [];
		const weeklyQuestIdsToReset: string[] = [];
		let shouldResetLastSymbolDaily = false;

		for (const symbol of symbolData) {
			for (const content of symbol.contents) {
				if (content.contentType === 'Daily Quest' && hasDailyResetOccurred(content.date)) {
					dailyQuestIdsToReset.push(content.id);
					shouldResetLastSymbolDaily = true;
				}

				if (content.tries != null && hasWeeklyResetOccurred(content.date)) {
					weeklyQuestIdsToReset.push(content.id);
				}
			}
		}

		const transactionPromises: Promise<unknown>[] = [];

		if (dailyQuestIdsToReset.length > 0) {
			transactionPromises.push(
				tx.characterContent.updateMany({
					where: { id: { in: dailyQuestIdsToReset } },
					data: { cleared: false },
				}),
			);
		}

		if (shouldResetLastSymbolDaily) {
			transactionPromises.push(
				tx.character.update({ where: { id: character.id }, data: { lastSymbolDaily: null } }),
			);
		}

		if (weeklyQuestIdsToReset.length > 0) {
			transactionPromises.push(
				tx.characterContent.updateMany({
					where: { id: { in: weeklyQuestIdsToReset } },
					data: { tries: DEFAULT_WEEKLY_TRIES, cleared: false },
				}),
			);
		}

		let externalData: getCharacterDataFromAPIResponseBody | null = null;
		if (externalDataPromise !== null) {
			externalData = await externalDataPromise;
		}

		if (externalData && externalData.level > character.level) {
			transactionPromises.push(
				tx.character.update({ where: { id: character.id }, data: { level: externalData.level } }),
			);

			if (externalData.level > 205) {
				transactionPromises.push(unlockArcaneContent(tx, character.id, 'Vanishing Journey', 'Reverse City'));
			}

			if (externalData.level > 215) {
				transactionPromises.push(unlockArcaneContent(tx, character.id, 'Chu Chu Island', 'Yum Yum Island'));
			}
		}

		if (transactionPromises.length > 0) {
			await Promise.all(transactionPromises);
		}
	});
};

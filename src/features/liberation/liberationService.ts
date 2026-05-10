import { GENESIS_MIN_LEVEL, DESTINY_MIN_LEVEL } from '@data/liberation/constant';
import { getBossPoints, getBossType } from '@data/liberation/liberationBosses';
import { resolveNextLiberationState } from '@data/liberation/liberationQuests';
import { nowInUtc } from '@utils/time';

import type { Prisma, PrismaClient } from '@prisma/client';

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

type LiberationPointsReturn = {
	bossType: string | null;
	points: number | null;
};

export const addPointsToLiberation = async (
	tx: TransactionClient,
	bossName: string,
	bossDifficulty: string,
	addOrRemove: number,
	authenticatedUserId: string,
	characterId: string,
	serverName: string,
): Promise<LiberationPointsReturn> => {
	const bossType = getBossType(bossName);
	const points = getBossPoints(bossName, bossDifficulty);

	if (points == 0 || bossType == null) {
		return { bossType, points: null };
	}

	const characterData = await tx.liberation.findFirst({
		where: { characterId: characterId, userId: authenticatedUserId, server: serverName },
		select: {
			id: true,
			currentGenesisQuest: true,
			currentGenesisPoints: true,
			genesisPass: true,
			liberated: true,
			currentDestinyQuest: true,
			currentDestinyPoints: true,
			character: { select: { level: true } },
			user: { select: { liberationLastUpdate: true } },
		},
	});
	if (!characterData) {
		throw new Error('BossList not found for user.');
	}

	const characterLevel = characterData.character.level;
	const isGenesisEnabled = characterLevel >= GENESIS_MIN_LEVEL;
	if (bossType === 'genesis' && !isGenesisEnabled) {
		return { bossType, points: null };
	}

	const isDestinyEnabled = characterData.liberated && characterLevel >= DESTINY_MIN_LEVEL;
	if (bossType === 'destiny' && !isDestinyEnabled) {
		return { bossType, points: null };
	}

	const isGenesisBoss = bossType === 'genesis';

	const currentQuest = isGenesisBoss ? characterData.currentGenesisQuest : characterData.currentDestinyQuest;
	const currentPoints = isGenesisBoss ? characterData.currentGenesisPoints : characterData.currentDestinyPoints;

	const updatePoints = points * addOrRemove;

	const newState = resolveNextLiberationState(bossType, currentQuest, currentPoints + updatePoints);

	const updateData: Prisma.LiberationUpdateInput = isGenesisBoss
		? {
				currentGenesisQuest: newState.questName,
				currentGenesisPoints: newState.points,
				...(newState.liberated ? { genesisPass: true } : {}),
			}
		: { currentDestinyQuest: newState.questName, currentDestinyPoints: newState.points };

	await Promise.all([
		tx.user.update({ where: { id: authenticatedUserId }, data: { liberationLastUpdate: nowInUtc() } }),
		tx.liberation.update({ where: { id: characterData.id }, data: updateData }),
	]);

	return { bossType, points: updatePoints };
};

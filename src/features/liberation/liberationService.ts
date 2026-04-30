import { GENESIS_MIN_LEVEL, DESTINY_MIN_LEVEL } from '@data/liberation/constant';
import { getBossPoints, getBossType } from '@data/liberation/liberationBosses';
import { resolveNextLiberationState } from '@data/liberation/liberationQuests';
import dayjs from '@utils/dayjs';

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
	try {
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
		const bossType = getBossType(bossName);
		const points = getBossPoints(bossName, bossDifficulty);
		if (points == 0 || bossType == null) {
			return { bossType, points: null };
		}
		const isGenesisEnabled = characterData.character.level <= GENESIS_MIN_LEVEL;
		const isDestinyEnabled = characterData.liberated && characterData.character.level <= DESTINY_MIN_LEVEL;
		if ((!isGenesisEnabled && bossType == 'genesis') || (!isDestinyEnabled && bossType == 'destiny')) {
			return { bossType, points: null };
		}

		const currentQuest = bossType == 'genesis' ? characterData.currentGenesisQuest : characterData.currentDestinyQuest;
		const currentPoints =
			bossType == 'genesis' ? characterData.currentGenesisPoints : characterData.currentDestinyPoints;

		const updatePoints = points * addOrRemove;
		const newPoints = currentPoints + updatePoints;

		const newState = resolveNextLiberationState(bossType, currentQuest, newPoints);

		const updateData: Prisma.LiberationUpdateInput = {};

		if (bossType === 'genesis') {
			updateData.currentGenesisQuest = newState.questName;
			updateData.currentGenesisPoints = newState.points;
			if (newState.liberated) {
				updateData.genesisPass = true;
			}
		} else {
			updateData.currentDestinyQuest = newState.questName;
			updateData.currentDestinyPoints = newState.points;
		}

		const now = dayjs().utc().toDate();

		await Promise.all([
			tx.user.update({ where: { id: authenticatedUserId }, data: { liberationLastUpdate: now } }),
			tx.liberation.update({ where: { id: characterData.id }, data: updateData }),
		]);

		return { bossType, points: updatePoints };
	} catch (error) {
		console.error('Error adding server to BossList:', error);
		throw error;
	}
};

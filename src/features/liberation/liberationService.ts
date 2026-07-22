import { hasSacredArea, getErionDifference } from '@data/liberation/astraDaily';
import { GENESIS_MIN_LEVEL, ASTRA_MIN_LEVEL, DESTINY_MIN_LEVEL } from '@data/liberation/constant';
import { getBossPoints, getBossType, getBossErionBattle } from '@data/liberation/liberationBosses';
import {
	resolveNextLiberationState,
	resolveNextAstraState,
	isLiberationQuestFinished,
	isAstraQuestFinished,
} from '@data/liberation/liberationQuests';
import { nowInUtc } from '@utils/time';

import type { Prisma, PrismaClient } from '@prisma/client';

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

type LiberationPointsReturn = {
	bossType: string | null;
	points: number | null;
	astra: { vestiges: number; traces: number } | null;
};

export const addPointsToLiberation = async (
	tx: TransactionClient,
	bossName: string,
	bossDifficulty: string,
	partySize: number,
	addOrRemove: number,
	authenticatedUserId: string,
	characterId: string,
	serverName: string,
): Promise<LiberationPointsReturn> => {
	const bossType = getBossType(bossName);
	if (bossType == null) {
		return { bossType, points: null, astra: null };
	}

	const isGenesisBoss = bossType === 'genesis';
	const points = Math.round(getBossPoints(bossName, bossDifficulty) / partySize);
	const { erion: baseErion, battle: baseBattle } = getBossErionBattle(bossName, bossDifficulty);
	const erion = Math.round(baseErion / partySize);
	const battle = Math.round(baseBattle / partySize);

	if (isGenesisBoss && points === 0) {
		return { bossType, points: null, astra: null };
	}
	if (!isGenesisBoss && points === 0 && erion === 0 && battle === 0) {
		return { bossType, points: null, astra: null };
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

			currentAstraQuest: true,
			currentAstraTracesPoints: true,
			currentAstraVestigesPoints: true,

			character: { select: { level: true } },
			user: { select: { liberationLastUpdate: true } },
		},
	});
	if (!characterData) {
		throw new Error('BossList not found for user.');
	}

	const characterLevel = characterData.character.level;
	if (isGenesisBoss) {
		const isGenesisEnabled = characterLevel >= GENESIS_MIN_LEVEL;

		if (!isGenesisEnabled || characterData.liberated) {
			return { bossType, points: null, astra: null };
		}

		const genesisMultiplier = isGenesisBoss && characterData.genesisPass ? 3 : 1;

		const updatePoints = points * addOrRemove * genesisMultiplier;
		const newState = resolveNextLiberationState(
			bossType,
			characterData.currentGenesisQuest,
			characterData.currentGenesisPoints + updatePoints,
		);

		await Promise.all([
			tx.user.update({ where: { id: authenticatedUserId }, data: { liberationLastUpdate: nowInUtc() } }),
			tx.liberation.update({
				where: { id: characterData.id },
				data: {
					currentGenesisQuest: newState.questName,
					currentGenesisPoints: newState.points,
					...(newState.liberated ? { genesisPass: true } : {}),
				},
			}),
		]);

		return { bossType, points: updatePoints, astra: null };
	}
	const isDestinyEnabled = characterData.liberated && characterLevel >= DESTINY_MIN_LEVEL;
	const isAstraEnabled = characterData.liberated && characterLevel >= ASTRA_MIN_LEVEL;

	const isDestinyFinished = isLiberationQuestFinished(
		'Destiny',
		characterData.currentDestinyQuest,
		characterData.currentDestinyPoints,
	);
	const isAstraFinished = isAstraQuestFinished(
		characterData.currentAstraQuest,
		characterData.currentAstraVestigesPoints,
		characterData.currentAstraTracesPoints,
	);

	const updateData: Prisma.LiberationUpdateInput = {};
	let destinyPointsAwarded: number | null = null;
	let astraAwarded: { vestiges: number; traces: number } | null = null;

	if (!isDestinyFinished && isDestinyEnabled && points > 0) {
		const updatePoints = points * addOrRemove;
		const newDestinyState = resolveNextLiberationState(
			bossType,
			characterData.currentDestinyQuest,
			characterData.currentDestinyPoints + updatePoints,
		);

		updateData.currentDestinyQuest = newDestinyState.questName;
		updateData.currentDestinyPoints = newDestinyState.points;
		destinyPointsAwarded = updatePoints;
	}

	if (!isAstraFinished && isAstraEnabled && erion >= 0 && battle > 0) {
		const updateVestiges = erion * addOrRemove;
		const updateTraces = battle * addOrRemove;
		const newAstraState = resolveNextAstraState(
			characterData.currentAstraQuest,
			characterData.currentAstraVestigesPoints + updateVestiges,
			characterData.currentAstraTracesPoints + updateTraces,
		);

		updateData.currentAstraQuest = newAstraState.questName;
		updateData.currentAstraVestigesPoints = newAstraState.vestiges;
		updateData.currentAstraTracesPoints = newAstraState.traces;
		astraAwarded = { vestiges: updateVestiges, traces: updateTraces };
	}

	if (destinyPointsAwarded === null && astraAwarded === null) {
		return { bossType, points: null, astra: null };
	}

	await Promise.all([
		tx.user.update({ where: { id: authenticatedUserId }, data: { liberationLastUpdate: nowInUtc() } }),
		tx.liberation.update({ where: { id: characterData.id }, data: updateData }),
	]);

	return { bossType, points: destinyPointsAwarded, astra: astraAwarded };
};

export const addErionToLiberationDaily = async (
	tx: TransactionClient,
	areaName: string,
	authenticatedUserId: string,
	characterId: string,
	serverName: string,
): Promise<number | null> => {
	const isErionArea = hasSacredArea(areaName);
	if (!isErionArea) {
		return null;
	}

	const characterData = await tx.liberation.findFirst({
		where: { characterId: characterId, userId: authenticatedUserId, server: serverName },
		select: {
			id: true,
			liberated: true,

			currentAstraQuest: true,
			currentAstraTracesPoints: true,
			currentAstraVestigesPoints: true,

			character: { select: { id: true, level: true, bossing: true, lastSymbolDaily: true } },
			user: { select: { liberationLastUpdate: true } },
		},
	});
	if (!characterData) {
		return null;
	}
	if (!characterData.character.bossing) {
		return null;
	}

	const isAstraEnabled = characterData.liberated && characterData.character.level >= ASTRA_MIN_LEVEL;
	if (!isAstraEnabled) {
		return null;
	}

	const realPoints = getErionDifference(characterData.character.lastSymbolDaily ?? '', areaName);

	const updatedVestiges = characterData.currentAstraVestigesPoints + realPoints;

	const newState = resolveNextAstraState(
		characterData.currentAstraQuest,
		updatedVestiges,
		characterData.currentAstraTracesPoints,
	);

	await Promise.all([
		tx.user.update({ where: { id: authenticatedUserId }, data: { liberationLastUpdate: nowInUtc() } }),
		tx.liberation.update({
			where: { id: characterData.id },
			data: {
				currentAstraQuest: newState.questName,
				currentAstraVestigesPoints: newState.vestiges,
			},
		}),
		tx.character.update({ where: { id: characterData.character.id }, data: { lastSymbolDaily: areaName } }),
	]);

	return realPoints;
};

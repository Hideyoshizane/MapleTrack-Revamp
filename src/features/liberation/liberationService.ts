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

import type { Prisma, PrismaClient } from '@generated/prisma/client';

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

type LiberationPointsReturn = {
	bossType: string | null;
	points: number | null;
	astra: { vestiges: number; traces: number } | null;
};

type LiberationCharacterData = NonNullable<Awaited<ReturnType<typeof getLiberationCharacterData>>>;

type LiberationProgressionResult = {
	updateData: Prisma.LiberationUpdateInput;
	destinyPoints: number | null;
	astra: { vestiges: number; traces: number } | null;
};

const getLiberationCharacterData = async (
	tx: TransactionClient,
	authenticatedUserId: string,
	characterId: string,
	serverName: string,
) => {
	return tx.liberation.findFirst({
		where: { characterId, userId: authenticatedUserId, server: serverName },
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
		},
	});
};

const updateGenesisLiberation = async (
	tx: TransactionClient,
	characterData: LiberationCharacterData,
	authenticatedUserId: string,
	points: number,
	addOrRemove: number,
): Promise<number | null> => {
	const isGenesisEnabled = characterData.character.level >= GENESIS_MIN_LEVEL;
	if (!isGenesisEnabled || characterData.liberated) {
		return null;
	}

	const genesisMultiplier = characterData.genesisPass ? 3 : 1;
	const updatePoints = points * addOrRemove * genesisMultiplier;

	// Resolve the next Genesis quest, accounting for overflow and point removal.
	const newState = resolveNextLiberationState(
		'genesis',
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
				liberated: newState.liberated,
				...(newState.liberated ? { genesisPass: true } : {}),
			},
		}),
	]);

	return updatePoints;
};

const resolveDestinyAndAstraProgression = (
	characterData: LiberationCharacterData,
	characterLevel: number,
	points: number,
	erion: number,
	battle: number,
	addOrRemove: number,
): LiberationProgressionResult => {
	const updateData: Prisma.LiberationUpdateInput = {};

	let destinyPoints: number | null = null;
	let astra: { vestiges: number; traces: number } | null = null;

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

	// Destiny and Astra progress independently, so both can receive points from the same boss.
	if (!isDestinyFinished && isDestinyEnabled && points > 0) {
		const updatePoints = points * addOrRemove;

		const newState = resolveNextLiberationState(
			'destiny',
			characterData.currentDestinyQuest,
			characterData.currentDestinyPoints + updatePoints,
		);

		updateData.currentDestinyQuest = newState.questName;
		updateData.currentDestinyPoints = newState.points;
		destinyPoints = updatePoints;
	}

	if (!isAstraFinished && isAstraEnabled && erion >= 0 && battle > 0) {
		const updateVestiges = erion * addOrRemove;
		const updateTraces = battle * addOrRemove;

		const newState = resolveNextAstraState(
			characterData.currentAstraQuest,
			characterData.currentAstraVestigesPoints + updateVestiges,
			characterData.currentAstraTracesPoints + updateTraces,
		);

		updateData.currentAstraQuest = newState.questName;
		updateData.currentAstraVestigesPoints = newState.vestiges;
		updateData.currentAstraTracesPoints = newState.traces;

		astra = { vestiges: updateVestiges, traces: updateTraces };
	}

	return { updateData, destinyPoints, astra };
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

	// Skip bosses that do not award points for the relevant progression systems.
	if (isGenesisBoss && points === 0) {
		return { bossType, points: null, astra: null };
	}

	if (!isGenesisBoss && points === 0 && erion === 0 && battle === 0) {
		return { bossType, points: null, astra: null };
	}

	const characterData = await getLiberationCharacterData(tx, authenticatedUserId, characterId, serverName);
	if (!characterData) {
		throw new Error('BossList not found for user.');
	}

	// Genesis bosses only contribute to Genesis progression.
	if (isGenesisBoss) {
		const genesisPoints = await updateGenesisLiberation(
			tx,
			characterData,
			authenticatedUserId,
			points,
			addOrRemove,
		);

		return { bossType, points: genesisPoints, astra: null };
	}

	// Other bosses can contribute to Destiny and Astra simultaneously.
	const progression = resolveDestinyAndAstraProgression(
		characterData,
		characterData.character.level,
		points,
		erion,
		battle,
		addOrRemove,
	);

	if (progression.destinyPoints === null && progression.astra === null) {
		return { bossType, points: null, astra: null };
	}

	// Persist all progression changes together.
	await Promise.all([
		tx.user.update({ where: { id: authenticatedUserId }, data: { liberationLastUpdate: nowInUtc() } }),
		tx.liberation.update({ where: { id: characterData.id }, data: progression.updateData }),
	]);

	return { bossType, points: progression.destinyPoints, astra: progression.astra };
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
			data: { currentAstraQuest: newState.questName, currentAstraVestigesPoints: newState.vestiges },
		}),
		tx.character.update({ where: { id: characterData.character.id }, data: { lastSymbolDaily: areaName } }),
	]);

	return realPoints;
};

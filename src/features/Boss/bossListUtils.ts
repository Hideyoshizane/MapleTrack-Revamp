import { produce } from 'immer';

import { getBossDifficultyValue } from '@data/bosses/bosses';

import type {
	getEditBossListResponseBody,
	getEditBossListCharacterResponseBody,
} from './schemas/bossList.response.schema';

type UpdateBossParams = {
	characterName: string;
	bossName: string;
	difficulty: string;
	server: string;
	reset: 'Daily' | 'Weekly' | 'Monthly';
	dailyTotal?: number;
};

export const updateCharacterBoss = (
	serverData: getEditBossListResponseBody,
	params: UpdateBossParams,
): getEditBossListResponseBody => {
	return produce(serverData, (draft) => {
		const character = draft.characters.find((c) => c.name === params.characterName);
		if (!character) {
			return;
		}

		const bossIndex = character.bosses.findIndex((b) => b.name === params.bossName && b.reset === params.reset);

		const newValue = getBossDifficultyValue(params.bossName, params.difficulty, params.server);
		if (newValue === null) {
			return;
		}

		const isDaily = params.reset === 'Daily';

		if (bossIndex === -1) {
			const multiplier = isDaily ? (params.dailyTotal ?? 0) : 1;

			character.bosses.push({
				name: params.bossName,
				difficulty: params.difficulty,
				reset: params.reset,
				dailyTotal: isDaily ? (params.dailyTotal ?? 0) : 0,
			});

			draft.totalGains += newValue * multiplier;
			character.totalIncome += newValue * multiplier;

			return;
		}

		const existingBoss = character.bosses[bossIndex];

		const oldValue = getBossDifficultyValue(params.bossName, existingBoss.difficulty, params.server);
		if (oldValue === null) {
			return;
		}

		const oldMultiplier = existingBoss.reset === 'Daily' ? (existingBoss.dailyTotal ?? 0) : 1;
		const oldDailyTotal = existingBoss.dailyTotal ?? 0;
		const isSameDifficulty = existingBoss.difficulty === params.difficulty;

		if (!isDaily && isSameDifficulty) {
			character.bosses.splice(bossIndex, 1);

			character.totalIncome -= oldValue * oldMultiplier;
			draft.totalGains -= oldValue * oldMultiplier;

			return;
		}

		draft.totalGains -= oldValue * oldMultiplier;
		character.totalIncome -= oldValue * oldMultiplier;

		if (isDaily && params.dailyTotal === 0) {
			character.bosses.splice(bossIndex, 1);

			return;
		}

		existingBoss.difficulty = params.difficulty;

		if (isDaily) {
			const newDailyTotal = params.dailyTotal ?? oldDailyTotal;
			existingBoss.dailyTotal = newDailyTotal;
		}

		const newMultiplier = isDaily ? (params.dailyTotal ?? existingBoss.dailyTotal ?? 0) : 1;

		draft.totalGains += newValue * newMultiplier;
		character.totalIncome += newValue * newMultiplier;
	});
};

export const countCharacterBosses = (character: getEditBossListCharacterResponseBody): number => {
	let totalBosses = 0;

	for (const boss of character.bosses) {
		if (boss.reset === 'Daily') {
			totalBosses += boss.dailyTotal ?? 0;
			continue;
		}

		totalBosses += 1;
	}

	return totalBosses;
};

export const countMonthlyBosses = (character: getEditBossListCharacterResponseBody): number => {
	return character.bosses.reduce<number>((total, boss) => {
		return boss.reset === 'Monthly' ? total + 1 : total;
	}, 0);
};

export const countServerBosses = (serverData: getEditBossListResponseBody): number => {
	return serverData.characters.reduce<number>((total, character) => {
		return total + countCharacterBosses(character);
	}, 0);
};

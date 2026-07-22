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
	partySize: number;
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
		const isDaily = params.reset === 'Daily';

		const newValue = getBossDifficultyValue(params.bossName, params.difficulty, params.server);
		if (newValue === null) {
			return;
		}

		if (bossIndex === -1) {
			const multiplier = isDaily ? (params.dailyTotal ?? 0) : 1;

			character.bosses.push({
				name: params.bossName,
				difficulty: params.difficulty,
				reset: params.reset,
				dailyTotal: isDaily ? (params.dailyTotal ?? 0) : 0,
				partySize: params.partySize,
			});

			character.totalIncome += Math.round((newValue * multiplier) / params.partySize);

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
		const isOnlyPartySizeChange =
			existingBoss.difficulty === params.difficulty && existingBoss.partySize !== params.partySize;

		if (isOnlyPartySizeChange) {
			const oldValue = getBossDifficultyValue(existingBoss.name, existingBoss.difficulty, params.server);
			const oldPartySize = existingBoss.partySize;

			existingBoss.partySize = params.partySize;
			character.totalIncome -= Math.round(oldValue / oldPartySize) - Math.round(oldValue / params.partySize);

			return;
		}

		if (!isDaily && isSameDifficulty) {
			character.bosses.splice(bossIndex, 1);

			character.totalIncome -= Math.round((oldValue * oldMultiplier) / existingBoss.partySize);

			return;
		}

		character.totalIncome -= Math.round((oldValue * oldMultiplier) / existingBoss.partySize);

		if (isDaily && params.dailyTotal === 0) {
			character.bosses.splice(bossIndex, 1);

			return;
		}

		existingBoss.difficulty = params.difficulty;
		existingBoss.partySize = params.partySize;

		if (isDaily) {
			existingBoss.dailyTotal = params.dailyTotal ?? oldDailyTotal;
		}

		const newMultiplier = isDaily ? (params.dailyTotal ?? existingBoss.dailyTotal ?? 0) : 1;

		character.totalIncome += Math.round((newValue * newMultiplier) / params.partySize);
	});
};

export const countCharacterBosses = (character: getEditBossListCharacterResponseBody): number => {
	let totalBosses = 0;

	for (const boss of character.bosses) {
		if (boss.reset === 'Daily') {
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

export const countServerGains = (serverData: getEditBossListResponseBody, serverName: string): number => {
	let total = 0;

	for (const character of serverData.characters) {
		for (const boss of character.bosses) {
			const value = getBossDifficultyValue(boss.name, boss.difficulty, serverName);

			if (value === null) {
				continue;
			}

			const multiplier = boss.reset === 'Daily' ? (boss.dailyTotal ?? 0) : 1;

			total += Math.round(value / boss.partySize) * multiplier;
		}
	}

	return total;
};

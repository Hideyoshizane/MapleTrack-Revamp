import { isRebootServer } from '../servers/servers';

import bossesJson from './bosses.json';

export type BossDifficulty = {
	name: string;
	value: number;
	reset: 'Daily' | 'Weekly' | 'Monthly';
	minLevel: number;
};

export type Boss = {
	name: string;
	img: string;
	difficulties: BossDifficulty[];
};

export const bosses: Boss[] = bossesJson as Boss[];

type BossCompositeKey = `${string}|${string}`;

type BossLookupEntry = {
	value: number;
	reset: BossDifficulty['reset'];
};

const bossLookup: Record<BossCompositeKey, BossLookupEntry> = {};
const bossImageLookup: Record<string, string> = {};
export const bossDifficultySet: Record<string, Set<string>> = {};

bosses.forEach((boss) => {
	bossImageLookup[boss.name] = boss.img;
	bossDifficultySet[boss.name] = new Set(boss.difficulties.map((d) => d.name));

	boss.difficulties.forEach((diff) => {
		const key: BossCompositeKey = `${boss.name}|${diff.name}`;
		bossLookup[key] = {
			value: diff.value,
			reset: diff.reset,
		};
	});
});

export const BOSS_NAMES = bosses.map((boss): string => boss.name) as readonly string[];

export const getBossDifficultyValue = (bossName: string, difficultyName: string, serverName: string): number | null => {
	const entry = bossLookup[`${bossName}|${difficultyName}`];

	if (!entry) {
		return null;
	}

	return isRebootServer(serverName) ? entry.value * 5 : entry.value;
};

export const getBossReset = (bossName: string, difficultyName: string): BossDifficulty['reset'] | null => {
	return bossLookup[`${bossName}|${difficultyName}`]?.reset ?? null;
};

export const isValidBossDifficulty = (bossName: string, difficultyName: string): boolean => {
	return bossDifficultySet[bossName]?.has(difficultyName) ?? false;
};

export const getBossImage = (bossName: string): string => {
	return bossImageLookup[bossName] ?? '/assets/boss/error.webp';
};

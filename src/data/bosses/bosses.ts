import { isRebootServer } from '../servers/servers';

import bossesJson from './bosses.json';

type BossDifficulty = {
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

const difficultySet: Set<string> = new Set();
const resetSet: Set<BossDifficulty['reset']> = new Set();
const bossNameSet: Set<string> = new Set();

for (const boss of bosses) {
	bossNameSet.add(boss.name);

	for (const difficulty of boss.difficulties) {
		difficultySet.add(difficulty.name);
		resetSet.add(difficulty.reset);
	}
}

export const BOSS_NAMES_ENUM = [...bossNameSet] as [string, ...string[]];
export const BOSS_DIFFICULTY_ENUM = [...difficultySet] as [string, ...string[]];
export const BOSS_RESET_ENUM = [...resetSet] as [BossDifficulty['reset'], ...BossDifficulty['reset'][]];

export type BossName = (typeof BOSS_NAMES_ENUM)[number];
export type BossDifficultyName = (typeof BOSS_DIFFICULTY_ENUM)[number];
export type BossReset = (typeof BOSS_RESET_ENUM)[number];

type BossCompositeKey = `${string}|${string}`;

type BossLookupEntry = {
	value: number;
	reset: BossDifficulty['reset'];
};

const bossLookup: Record<BossCompositeKey, BossLookupEntry> = {};
const bossImageLookup: Record<BossName, string> = {} as Record<BossName, string>;
export const bossDifficultySet: Record<BossName, Set<BossDifficultyName>> = {} as Record<
	BossName,
	Set<BossDifficultyName>
>;

for (const boss of bosses) {
	bossImageLookup[boss.name as BossName] = boss.img;

	const difficultyNames = new Set<BossDifficultyName>();
	bossDifficultySet[boss.name as BossName] = difficultyNames;

	for (const diff of boss.difficulties) {
		difficultyNames.add(diff.name as BossDifficultyName);

		const key: BossCompositeKey = `${boss.name}|${diff.name}`;
		bossLookup[key] = { value: diff.value, reset: diff.reset };
	}
}

const bossNameRuntimeSet: Set<string> = new Set(BOSS_NAMES_ENUM);
const difficultyRuntimeSet: Set<string> = new Set(BOSS_DIFFICULTY_ENUM);

export const isBossName = (value: string): value is BossName => {
	return bossNameRuntimeSet.has(value);
};

export const isBossDifficultyName = (value: string): value is BossDifficultyName => {
	return difficultyRuntimeSet.has(value);
};

export const parseBossName = (value: string): BossName | null => {
	return isBossName(value) ? value : null;
};

export const parseBossDifficultyName = (value: string): BossDifficultyName | null => {
	return isBossDifficultyName(value) ? value : null;
};

export const getBossDifficultyValue = (
	bossName: BossName,
	difficultyName: BossDifficultyName,
	serverName: string,
): number => {
	const entry = bossLookup[`${bossName}|${difficultyName}`];

	if (!entry) {
		return 0;
	}

	return isRebootServer(serverName) ? entry.value * 5 : entry.value;
};

export const getBossReset = (bossName: BossName, difficultyName: BossDifficultyName): BossReset | null => {
	return bossLookup[`${bossName}|${difficultyName}`]?.reset ?? null;
};

export const isValidBossDifficulty = (bossName: BossName, difficultyName: BossDifficultyName): boolean => {
	return bossDifficultySet[bossName]?.has(difficultyName) ?? false;
};

export const getBossImage = (bossName: BossName): string => {
	return bossImageLookup[bossName] ?? '/assets/boss/error.webp';
};

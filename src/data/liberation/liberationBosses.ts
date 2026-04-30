import { isValidBossDifficulty } from '../bosses/bosses';

import liberationBossesJson from './liberationBosses.json';

import type { BossName } from '../bosses/bosses';
import type { checkedBossResponseBody } from '@features/liberation/schemas/liberation.response.schema';

export type BossType = 'genesis' | 'destiny';

export type BossDifficulty = {
	name: string;
	points: number;
	reset: string;
};

export type Boss = {
	name: string;
	type: BossType;
	img: string;
	difficulties: BossDifficulty[];
};

type BossPoints = {
	points: number;
	reset: string;
};

export type WeeklyMonthlyPoints = {
	thisWeekPoints: number;
	totalWeeklyPoints: number;
	thisMonthPoints: number;
	totalMonthlyPoints: number;
	bosses: Record<string, BossPoints>;
};

export const bosses: Boss[] = liberationBossesJson as Boss[];

// Zod validation
export const bossNamesPoints = bosses.map((boss) => boss.name) as unknown as [string, ...string[]];
export const bossDifficultyNames = [
	...new Set(bosses.flatMap((boss) => boss.difficulties.map((d) => d.name))),
] as unknown as [string, ...string[]];
export const bossDifficultyWithSkip = ['Skip', ...bossDifficultyNames] as unknown as [string, ...string[]];

type BossPointsMap = Map<string, Map<string, number>>;
type BossResetMap = Map<string, Map<string, string>>;
type BossesByTypeMap = Map<BossType, Boss[]>;

const createBossPointsMap = (bossList: Boss[]): BossPointsMap => {
	return new Map(
		bossList.map((boss): [string, Map<string, number>] => [
			boss.name,
			new Map(boss.difficulties.map((difficulty): [string, number] => [difficulty.name, difficulty.points])),
		]),
	);
};

const createBossResetMap = (bossList: Boss[]): BossResetMap => {
	return new Map(
		bossList.map((boss): [string, Map<string, string>] => [
			boss.name,
			new Map(boss.difficulties.map((difficulty): [string, string] => [difficulty.name, difficulty.reset])),
		]),
	);
};

const createBossesByTypeMap = (bossList: Boss[]): BossesByTypeMap => {
	return new Map(
		(['genesis', 'destiny'] as const).map((type): [BossType, Boss[]] => [
			type,
			bossList.filter((boss): boolean => boss.type === type),
		]),
	);
};

const bossPointsMap: BossPointsMap = createBossPointsMap(bosses);
const bossResetMap: BossResetMap = createBossResetMap(bosses);
const bossesByTypeMap: BossesByTypeMap = createBossesByTypeMap(bosses);

export const getBossPoints = (bossName: string, difficultyName: string): number => {
	return bossPointsMap.get(bossName)?.get(difficultyName) ?? 0;
};

export const getBossReset = (bossName: string, difficultyName: string): string | null => {
	return bossResetMap.get(bossName)?.get(difficultyName) ?? null;
};

export const getBossType = (bossName: string): BossType | null => {
	const genesisBosses = bossesByTypeMap.get('genesis') ?? [];
	const isGenesis = genesisBosses.some((boss) => boss.name === bossName);
	if (isGenesis) {
		return 'genesis';
	}
	const destinyBosses = bossesByTypeMap.get('destiny') ?? [];
	const isDestiny = destinyBosses.some((boss) => boss.name === bossName);

	if (isDestiny) {
		return 'destiny';
	}

	return null;
};

export const isBossType = (value: string): value is BossType => {
	return value === 'genesis' || value === 'destiny';
};

export const normalizeBossType = (value: string): BossType | null => {
	const normalizedValue = value.toLowerCase();

	if (isBossType(normalizedValue)) {
		return normalizedValue;
	}

	return null;
};

export const getBossesByType = (type: string): Boss[] => {
	const normalizedType = normalizeBossType(type);

	if (!normalizedType) {
		return [];
	}

	return bossesByTypeMap.get(normalizedType) ?? [];
};

export const isValidBossDifficultyOrSkip = (bossName: BossName, difficultyName: string): boolean => {
	if (difficultyName === 'Skip') {
		return true;
	}
	return isValidBossDifficulty(bossName, difficultyName);
};

export const createNormalizedEmptyBossList = (type: string): checkedBossResponseBody[] => {
	const bosses = getBossesByType(type);

	return bosses.map((boss): checkedBossResponseBody => ({ name: boss.name, type: 'Skip' }));
};

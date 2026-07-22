import { isValidBossDifficulty } from '../bosses/bosses';

import astraBossesJson from './astraBosses.json';
import destinyBossesJson from './destinyBosses.json';
import genesisBossesJson from './genesisBosses.json';

import type { BossName } from '../bosses/bosses';
import type { checkedBossResponseBody } from '@features/liberation/schemas/liberation.response.schema';

export const BOSS_TYPES = ['genesis', 'destiny', 'astra'] as const;
export type BossType = (typeof BOSS_TYPES)[number];

export type PointsBossDifficulty = {
	name: string;
	reset: string;
	points: number;
};

export type AstraBossDifficulty = {
	name: string;
	reset: string;
	erion: number;
	battle: number;
};

export type BossDifficulty = PointsBossDifficulty | AstraBossDifficulty;

export type RawBoss = {
	name: string;
	img: string;
	maxPartySize: number;
	difficulties: BossDifficulty[];
};

export type Boss = RawBoss & {
	type: BossType;
};

type BossValue = { points: number; reset: string } | { erion: number; battle: number; reset: string };

export type WeeklyMonthlyPoints = {
	thisWeekPoints: number;
	totalWeeklyPoints: number;
	thisMonthPoints: number;
	totalMonthlyPoints: number;

	thisWeekErion: number;
	totalWeeklyErion: number;

	thisWeekBattle: number;
	totalWeeklyBattle: number;

	bosses: Record<string, BossValue>;
};

const rawBossJsonByType: Record<BossType, RawBoss[]> = {
	genesis: genesisBossesJson,
	destiny: destinyBossesJson,
	astra: astraBossesJson,
};

export const createEmptyWeeklyMonthlyPoints = (): WeeklyMonthlyPoints => ({
	thisWeekPoints: 0,
	totalWeeklyPoints: 0,
	thisMonthPoints: 0,
	totalMonthlyPoints: 0,

	thisWeekErion: 0,
	totalWeeklyErion: 0,

	thisWeekBattle: 0,
	totalWeeklyBattle: 0,

	bosses: {},
});

const bossJsonByType: Record<BossType, Boss[]> = Object.fromEntries(
	BOSS_TYPES.map((type): [BossType, Boss[]] => [
		type,
		rawBossJsonByType[type].map((boss): Boss => ({ ...boss, type })),
	]),
) as Record<BossType, Boss[]>;

const bosses: Boss[] = BOSS_TYPES.flatMap((type) => bossJsonByType[type]);

// Zod validation
export const bossNamesPoints = [...new Set(bosses.map((boss) => boss.name))] as unknown as [string, ...string[]];

const bossDifficultyNames = [...new Set(bosses.flatMap((boss) => boss.difficulties.map((d) => d.name)))] as unknown as [
	string,
	...string[],
];

export const bossDifficultyWithSkip = ['Skip', ...bossDifficultyNames] as unknown as [string, ...string[]];

const isPointsDifficulty = (difficulty: BossDifficulty): difficulty is PointsBossDifficulty => 'points' in difficulty;

export const isAstraDifficulty = (difficulty: BossDifficulty): difficulty is AstraBossDifficulty =>
	'erion' in difficulty && 'battle' in difficulty;

const createBossDifficultyMap = <TDifficulty extends BossDifficulty, TValue>(
	bossList: readonly Boss[],
	isDifficulty: (difficulty: BossDifficulty) => difficulty is TDifficulty,
	getValue: (difficulty: TDifficulty) => TValue,
): Map<string, Map<string, TValue>> => {
	return new Map(
		bossList.map((boss) => [
			boss.name,
			new Map(
				boss.difficulties.filter(isDifficulty).map((difficulty) => [difficulty.name, getValue(difficulty)]),
			),
		]),
	);
};

const bossPointsMap = createBossDifficultyMap(
	[...bossJsonByType.genesis, ...bossJsonByType.destiny],
	isPointsDifficulty,
	(difficulty) => difficulty.points,
);

const bossErionBattleMap = createBossDifficultyMap(bossJsonByType.astra, isAstraDifficulty, (difficulty) => ({
	erion: difficulty.erion,
	battle: difficulty.battle,
}));

const bossTypeMap = new Map(bosses.map((boss): [string, BossType] => [boss.name, boss.type]));

const bossMaxPartySizeMap = new Map(bosses.map((boss): [string, number] => [boss.name, boss.maxPartySize]));

export const getBossPoints = (bossName: string, difficultyName: string): number =>
	bossPointsMap.get(bossName)?.get(difficultyName) ?? 0;

export const getBossErionBattle = (bossName: string, difficultyName: string): { erion: number; battle: number } =>
	bossErionBattleMap.get(bossName)?.get(difficultyName) ?? { erion: 0, battle: 0 };

export const getBossType = (bossName: string): BossType | null => bossTypeMap.get(bossName) ?? null;

export const getBossMaxPartySize = (bossName: string): number => bossMaxPartySizeMap.get(bossName) ?? 1;

const isBossType = (value: string): value is BossType => (BOSS_TYPES as readonly string[]).includes(value);

export const normalizeBossType = (value: string): BossType | null => {
	if (value == null) {
		return null;
	}

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

	return bossJsonByType[normalizedType];
};

export const isValidBossDifficultyOrSkip = (bossName: BossName, difficultyName: string): boolean => {
	if (difficultyName === 'Skip') {
		return true;
	}

	return isValidBossDifficulty(bossName, difficultyName);
};

export const createNormalizedEmptyBossList = (type: string): checkedBossResponseBody[] =>
	getBossesByType(type).map(
		(boss): checkedBossResponseBody => ({ name: boss.name, type: 'Skip', partySize: 1, cleared: false }),
	);

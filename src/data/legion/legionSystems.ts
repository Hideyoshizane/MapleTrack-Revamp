import legionSystemsJson from './legionSystems.json';

type LegionBonusRank = {
	rank: string;
	description: string;
};

type LegionBonus = {
	name: string;
	jobType: string;
	ranking: LegionBonusRank[];
};

type LegionRank = 'rank_b' | 'rank_a' | 'rank_s' | 'rank_ss' | 'rank_sss' | 'no_rank';
type LegionThresholdSetCode = 'zero' | 'default';

type ThresholdTuple = readonly [number, number, number, number, number];

const legionList = legionSystemsJson as readonly LegionBonus[];
const ZERO_THRESHOLDS = [130, 160, 180, 200, 250] as const;
const DEFAULT_THRESHOLDS = [60, 100, 140, 200, 250] as const;

const legionByName: Readonly<Record<string, LegionBonus>> = Object.fromEntries(
	legionList.map((entry): [string, LegionBonus] => [entry.name, entry]),
);

export const getLegionData = (name: string): LegionBonus | undefined => legionByName[name];

const getRankFromThresholds = (level: number, thresholds: ThresholdTuple): LegionRank => {
	if (level < thresholds[0]) {
		return 'no_rank';
	}
	if (level < thresholds[1]) {
		return 'rank_b';
	}
	if (level < thresholds[2]) {
		return 'rank_a';
	}
	if (level < thresholds[3]) {
		return 'rank_s';
	}
	if (level < thresholds[4]) {
		return 'rank_ss';
	}

	return 'rank_sss';
};

export const getRank = (level: number, code?: LegionThresholdSetCode): LegionRank => {
	if (!code) {
		return 'no_rank';
	}

	return code === 'zero'
		? getRankFromThresholds(level, ZERO_THRESHOLDS)
		: getRankFromThresholds(level, DEFAULT_THRESHOLDS);
};
export const codeToLegionThresholdSet = (code: string): LegionThresholdSetCode =>
	code === 'zero' ? 'zero' : 'default';

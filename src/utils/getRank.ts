export type Rank = 'rank_b' | 'rank_a' | 'rank_s' | 'rank_ss' | 'rank_sss' | 'no_rank';

type Threshold = { min: number; max?: number; rank: Rank };

export type ThresholdSetCode = 'zero' | 'default';

const thresholds: Record<ThresholdSetCode, Threshold[]> = {
	zero: [
		{ min: 130, max: 159, rank: 'rank_b' },
		{ min: 160, max: 179, rank: 'rank_a' },
		{ min: 180, max: 199, rank: 'rank_s' },
		{ min: 200, max: 249, rank: 'rank_ss' },
		{ min: 250, rank: 'rank_sss' },
	],
	default: [
		{ min: 60, max: 99, rank: 'rank_b' },
		{ min: 100, max: 139, rank: 'rank_a' },
		{ min: 140, max: 199, rank: 'rank_s' },
		{ min: 200, max: 249, rank: 'rank_ss' },
		{ min: 250, rank: 'rank_sss' },
	],
};

export const getRank = (level: number, code?: ThresholdSetCode): Rank => {
	if (!code) {
		return 'no_rank';
	}

	const validCode: ThresholdSetCode = code === 'zero' ? 'zero' : 'default';
	const set = thresholds[validCode];

	const found = set.find(({ min, max }) => level >= min && (max === undefined || level <= max));

	return found?.rank ?? 'no_rank';
};

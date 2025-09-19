export type Rank = 'rank_b' | 'rank_a' | 'rank_s' | 'rank_ss' | 'rank_sss' | 'no_rank';

export const getRank = (level: number, characterCode?: string): Rank => {
	if (!characterCode) return 'no_rank';

	if (characterCode === 'zero') {
		if (level >= 130 && level <= 159) return 'rank_b';
		if (level >= 160 && level <= 179) return 'rank_a';
		if (level >= 180 && level <= 199) return 'rank_s';
		if (level >= 200 && level <= 249) return 'rank_ss';
		if (level >= 250) return 'rank_sss';
	} else {
		if (level >= 60 && level <= 99) return 'rank_b';
		if (level >= 100 && level <= 139) return 'rank_a';
		if (level >= 140 && level <= 199) return 'rank_s';
		if (level >= 200 && level <= 249) return 'rank_ss';
		if (level >= 250) return 'rank_sss';
	}

	return 'no_rank';
};

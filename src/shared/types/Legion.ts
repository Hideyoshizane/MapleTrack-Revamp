interface LegionBonusRank {
	rank: string;
	description: string;
}

export interface LegionBonus {
	name: string;
	class: string;
	ranking: LegionBonusRank[];
}

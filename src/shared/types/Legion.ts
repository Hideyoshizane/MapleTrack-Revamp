type LegionBonusRank = {
	rank: string;
	description: string;
};

export type LegionBonus = {
	name: string;
	class: string;
	ranking: LegionBonusRank[];
};

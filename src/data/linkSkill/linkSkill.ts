import linkSkillsData from './linkSkill.json';

type LinkSkillLevel = {
	level: number;
	description: string;
};

type LinkSkill = {
	name: string;
	image: string;
	levels: LinkSkillLevel[];
};

const linkSkills: LinkSkill[] = linkSkillsData as LinkSkill[];

const linkSkillsByName: ReadonlyMap<string, LinkSkill> = new Map(
	linkSkills.map((skill): [string, LinkSkill] => [skill.name, skill]),
);

export const getLinkSkillByName = (name: string): LinkSkill | undefined => linkSkillsByName.get(name);

export const getLinkSkillDescription = (linkSkill: LinkSkill, characterLevel: number): string => {
	const levels = linkSkill?.levels;

	if (!levels?.length) {
		return '';
	}

	const rhinneThresholds = [0, 128, 138, 176, 177, 178];
	const defaultThresholds = [0, 120, 210];

	const thresholds = linkSkill.name === "Rhinne's Blessing" ? rhinneThresholds : defaultThresholds;

	const levelIndex = Math.min(
		thresholds.reduce<number>((index, threshold, i) => {
			return characterLevel >= threshold ? i : index;
		}, 0),
		levels.length - 1,
	);

	return levels[levelIndex]?.description ?? '';
};

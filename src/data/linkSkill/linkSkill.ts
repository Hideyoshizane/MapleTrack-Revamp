import linkSkillsData from './linkSkill.json';

// Define interface for each level of a link skill
export interface LinkSkillLevel {
	level: number;
	description: string;
}

// Define interface for a link skill
export interface LinkSkill {
	name: string;
	image: string;
	levels: LinkSkillLevel[];
}

// Type the imported JSON
export const linkSkills: LinkSkill[] = linkSkillsData as LinkSkill[];

export function getLinkSkillByName(name: string): LinkSkill | undefined {
	return linkSkills.find((skill) => skill.name === name);
}

export function getLinkSkillDescription(linkSkill: LinkSkill, characterLevel: number): string {
	if (!linkSkill || !linkSkill.levels?.length) return '';

	let skillLevel = 1; // default to level 1

	if (characterLevel >= 70 && characterLevel < 120) {
		skillLevel = 1;
	} else if (characterLevel >= 120 && characterLevel < 210) {
		skillLevel = 2;
	} else if (characterLevel >= 210) {
		skillLevel = 3;
	}

	const selectedLevel =
		linkSkill.levels.find((l) => l.level === skillLevel) || linkSkill.levels[linkSkill.levels.length - 1];

	return selectedLevel.description;
}

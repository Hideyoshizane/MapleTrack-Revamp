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

// Typed JSON import
export const linkSkills: LinkSkill[] = linkSkillsData as LinkSkill[];

// Find link skill by name
export const getLinkSkillByName = (name: string): LinkSkill | undefined =>
	linkSkills.find((skill): boolean => skill.name === name);

// Get link skill description for a character level
export const getLinkSkillDescription = (linkSkill: LinkSkill, characterLevel: number): string => {
	if (!linkSkill?.levels?.length) return '';

	// Determine skill level based on character level
	const skillLevel = characterLevel >= 210 ? 3 : characterLevel >= 120 ? 2 : 1;

	// Find the matching level or fallback to highest available
	const selectedLevel =
		linkSkill.levels.find((l): boolean => l.level === skillLevel) || linkSkill.levels[linkSkill.levels.length - 1];

	return selectedLevel.description;
};

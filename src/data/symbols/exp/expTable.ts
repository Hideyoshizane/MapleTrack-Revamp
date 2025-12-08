import arcaneExpJson from './arcaneForceExp.json';
import grandSacredExpJson from './grandSacredForceExp.json';
import sacredExpJson from './sacredForceExp.json';

// Base type for each level entry
type ExpLevel = {
	EXP: number;
};

// Generic shape of EXP tables
type ExpData = {
	level: Record<string, ExpLevel>;
};

// Explicit constants for each system
const arcaneExp: ExpData = arcaneExpJson as ExpData;
const sacredExp: ExpData = sacredExpJson as ExpData;
const grandSacredExp: ExpData = grandSacredExpJson as ExpData;

// Enum to identify each system
type ForceType = 'arcane' | 'sacred' | 'grand';

// Mapping between type and dataset
const expTables: Record<ForceType, ExpData> = { arcane: arcaneExp, sacred: sacredExp, grand: grandSacredExp };

// Get EXP required for a specific level
export const getExpForLevel = (type: ForceType, level: number): number =>
	expTables[type].level[level.toString()]?.EXP ?? 0;

// Get the last level in the table
export const getLastLevel = (type: ForceType): number => {
	const levels = Object.keys(expTables[type].level).map(Number);
	return levels.length ? Math.max(...levels) : 0;
};

// Get remaining EXP to reach max level
export const getRemainingExp = (type: ForceType, currentLevel: number, currentExp: number): number => {
	try {
		const lastLevel = getLastLevel(type);
		if (currentLevel >= lastLevel) return 0;

		// EXP needed to finish current level
		let remaining = Math.max(getExpForLevel(type, currentLevel) - currentExp, 0);

		// Add EXP for all remaining levels
		for (let lvl = currentLevel + 1; lvl <= lastLevel; lvl++) {
			remaining += getExpForLevel(type, lvl);
		}

		return remaining;
	} catch (error) {
		console.error(`Error calculating remaining EXP for ${type}:`, error);
		return 0;
	}
};

import arcaneExpJson from './arcaneForceExp.json';
import grandSacredExpJson from './grandSacredForceExp.json';
import sacredExpJson from './sacredForceExp.json';

// Base type for each level entry
export interface ExpLevel {
	EXP: number;
}

// Generic shape of EXP tables
export interface ExpData {
	level: Record<string, ExpLevel>;
}

// Explicit constants for each system
export const arcaneExp: ExpData = arcaneExpJson as ExpData;
export const sacredExp: ExpData = sacredExpJson as ExpData;
export const grandSacredExp: ExpData = grandSacredExpJson as ExpData;

// Enum to identify each system
export type ForceType = 'arcane' | 'sacred' | 'grand';

// Mapping between type and dataset
const expTables: Record<ForceType, ExpData> = {
	arcane: arcaneExp,
	sacred: sacredExp,
	grand: grandSacredExp,
};

export function getExpForLevel(type: ForceType, level: number): number {
	try {
		const table = expTables[type];
		const expEntry = table.level[level.toString()];
		return expEntry?.EXP ?? 0;
	} catch (error) {
		console.error(`Error fetching EXP for ${type} at level ${level}:`, error);
		return 0;
	}
}

export function getLastLevel(type: ForceType): number {
	try {
		const table = expTables[type];
		const levels = Object.keys(table.level).map(Number);
		return levels.length > 0 ? Math.max(...levels) : 0;
	} catch (error) {
		console.error(`Error fetching last level for ${type}:`, error);
		return 0;
	}
}

export function getRemainingExp(type: ForceType, currentLevel: number, currentExp: number): number {
	try {
		const lastLevel = getLastLevel(type);

		if (currentLevel >= lastLevel) return 0;

		let remaining = 0;

		// Add EXP needed for current level to reach next level
		const currentLevelExp = getExpForLevel(type, currentLevel);
		remaining += currentLevelExp - currentExp;

		// Add EXP for all remaining levels after current
		for (let lvl = currentLevel + 1; lvl <= lastLevel; lvl++) {
			remaining += getExpForLevel(type, lvl);
		}

		return remaining;
	} catch (error) {
		console.error(`Error calculating remaining EXP for ${type}:`, error);
		return 0;
	}
}

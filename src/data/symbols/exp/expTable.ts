import arcaneExpJson from './arcaneForceExp.json';
import grandSacredExpJson from './grandSacredForceExp.json';
import sacredExpJson from './sacredForceExp.json';

type ExpLevel = { EXP: number };
type ExpData = { level: Record<string, ExpLevel> };

type ForceType = 'arcane' | 'sacred' | 'grand';

type ExpDataNumeric = {
	level: Record<number, ExpLevel>;
	lastLevel: number;
	cumulativeExp: number[];
};

const buildExpData = (data: ExpData): ExpDataNumeric => {
	const numericLevel: Record<number, ExpLevel> = {};
	const levels = Object.keys(data.level)
		.map(Number)
		.sort((a, b) => a - b);

	const cumulativeExp: number[] = [];
	let total = 0;

	for (const lvl of levels) {
		const exp = data.level[lvl.toString()]?.EXP ?? 0;
		numericLevel[lvl] = { EXP: exp };
		total += exp;
		cumulativeExp[lvl] = total;
	}

	return { level: numericLevel, lastLevel: Math.max(...levels), cumulativeExp };
};

// Explicit constants for each system
const arcaneExp: ExpDataNumeric = buildExpData(arcaneExpJson);
const sacredExp: ExpDataNumeric = buildExpData(sacredExpJson);
const grandSacredExp: ExpDataNumeric = buildExpData(grandSacredExpJson);

const expTables: Record<ForceType, ExpDataNumeric> = { arcane: arcaneExp, sacred: sacredExp, grand: grandSacredExp };

export const getExpForLevel = (type: ForceType, level: number): number => expTables[type].level[level]?.EXP ?? 0;

export const getLastLevel = (type: ForceType): number => expTables[type].lastLevel;

// Get remaining EXP to reach max level
export const getRemainingExp = (type: ForceType, currentLevel: number, currentExp: number): number => {
	const table = expTables[type];
	const lastLevel = table.lastLevel;

	if (currentLevel >= lastLevel) {
		return 0;
	}

	// Total EXP needed to reach last level
	const totalExpToLast = table.cumulativeExp[lastLevel] ?? 0;

	// Total EXP already obtained (current level's previous levels + current EXP)
	const expSoFar = (table.cumulativeExp[currentLevel - 1] ?? 0) + currentExp;

	return Math.max(totalExpToLast - expSoFar, 0);
};

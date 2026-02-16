import { getRemainingExp, getExpForLevel, getLastLevel } from '@data/symbols/exp/expTable';

import { allSymbols } from './dailyExp';

import type { CharacterSymbol, CharacterContent } from '@features/character/characterModel';

export const SYMBOL_CONFIG = {
	arcane: {
		folder: '/assets/arcaneforce/',
		maxLevel: 20,
		names: ['Vanishing Journey', 'Chu Chu Island', 'Lachelein', 'Arcana', 'Morass', 'Esfera'],
	},
	sacred: {
		folder: '/assets/sacredforce/',
		maxLevel: 11,
		names: ['Cernium', 'Arcus', 'Odium', 'Shangri-La', 'Arteria', 'Carcion'],
	},
	grand: {
		folder: '/assets/grandsacredforce/',
		maxLevel: 11,
		names: ['Tallahart'],
	},
} as const;

export type SymbolCategory = keyof typeof SYMBOL_CONFIG;

export type SymbolName = {
	[C in SymbolCategory]: (typeof SYMBOL_CONFIG)[C]['names'][number];
}[SymbolCategory];

type SymbolInfo = {
	category: SymbolCategory;
	file: string;
	minLevel?: number;
	maxLevel: number;
};

const symbolExpIndex = new Map(allSymbols.map((symbol) => [symbol.name, symbol]));

const contentValueIndex = new Map(allSymbols.map((symbol) => [symbol.name, Number(symbol.value) || 0]));

const SYMBOL_MAP: Record<SymbolName, SymbolInfo> = Object.fromEntries(
	Object.entries(SYMBOL_CONFIG).flatMap(([category, config]) =>
		config.names.map((name) => {
			const expSymbol = symbolExpIndex.get(name);

			return [
				name,
				{
					category: category as SymbolCategory,
					file: name.toLowerCase().replace(/ /g, '_'),
					minLevel: expSymbol?.minLevel ? Number(expSymbol.minLevel) : undefined,
					maxLevel: config.maxLevel,
				},
			];
		}),
	),
) as Record<SymbolName, SymbolInfo>;

export const getSymbolImagePath = (name: SymbolName): string => {
	const info = SYMBOL_MAP[name];
	const folder = SYMBOL_CONFIG[info.category].folder;
	return `${folder}${info.file}.webp`;
};

export const isSymbolName = (value: string): value is SymbolName => {
	return value in SYMBOL_MAP;
};

export const toSymbolName = (value: string): SymbolName | null => {
	if (isSymbolName(value)) {
		return value;
	}

	return null;
};

export const canUseSymbol = (level: number, name: SymbolName): boolean => {
	const minLevel = SYMBOL_MAP[name].minLevel;
	return minLevel === undefined || level >= minLevel;
};

export const getSymbolMinLevel = (name: SymbolName): number => SYMBOL_MAP[name].minLevel ?? 0;

export const getSymbolMaxLevel = (input: SymbolCategory | SymbolName): number => {
	if (input in SYMBOL_CONFIG) {
		return SYMBOL_CONFIG[input as SymbolCategory].maxLevel;
	}
	return SYMBOL_MAP[input as SymbolName].maxLevel;
};

export const getContentValue = (symbolName: SymbolName, contentType: string): number => {
	const resolve = (name: string): number => contentValueIndex.get(name) ?? 0;

	if (contentType === 'Daily Quest') {
		return resolve(symbolName);
	}

	const value = resolve(contentType);
	return value !== 0 ? value : resolve('Weekly');
};

export const computeDailyWeeklyValues = (
	symbol: CharacterSymbol,
	content: CharacterContent[],
): { dailyValue: number; weeklyValue: number } => {
	const dailyValue =
		(content[0]?.checked ? getContentValue(symbol.name as SymbolName, content[0].contentType) : 0) +
		(content[2]?.checked ? getContentValue(symbol.name as SymbolName, content[2].contentType) : 0);

	const weeklyValue = content[1]?.checked ? getContentValue(symbol.name as SymbolName, 'Weekly') : 0;

	return { dailyValue, weeklyValue };
};

export const calculateDaysToCompleteSymbol = (
	daily: number,
	weekly: number,
	type: SymbolCategory,
	symbolLevel: number,
	symbolExp: number,
): number => {
	let remaining = getRemainingExp(type, symbolLevel, symbolExp);

	if (remaining <= 0) {
		return 0;
	}

	if (daily <= 0 && weekly <= 0) {
		return Infinity;
	}

	const weeklyTotal = weekly * 3;
	const dailyGainPerWeek = daily * 7;
	const totalExpPerWeek = dailyGainPerWeek + weeklyTotal;

	const weeksNeeded = Math.floor(remaining / totalExpPerWeek);
	remaining -= weeksNeeded * totalExpPerWeek;

	let remainingDays = 0;

	while (remaining > 0) {
		remainingDays++;
		remaining -= daily;

		if (remainingDays % 7 === 0) {
			remaining -= weeklyTotal;
		}
	}

	return weeksNeeded * 7 + remainingDays;
};

export type LevelUpResult = {
	currentLevel: number;
	currentExp: number;
};

export const calculateNewLevelFromExp = (
	type: SymbolCategory,
	currentLevel: number,
	currentExp: number,
): LevelUpResult => {
	let level = currentLevel;
	let exp = currentExp;
	const maxLevel = getLastLevel(type);

	while (level < maxLevel) {
		const expForNextLevel = getExpForLevel(type, level);

		if (exp >= expForNextLevel) {
			exp -= expForNextLevel;
			level++;
			continue;
		}

		break;
	}

	return { currentLevel: level, currentExp: exp };
};

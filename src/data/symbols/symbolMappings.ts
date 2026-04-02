import { getRemainingExp, getExpForLevel, getLastLevel } from '@data/symbols/exp/expTable';

import { allSymbols } from './dailyExp';

import type { CharacterSymbol, CharacterContent } from '@features/character/characterModel';

export const SYMBOL_CONFIG = {
	arcane: {
		folder: '/assets/arcaneforce/',
		maxLevel: 20,
		names: ['Vanishing Journey', 'Chu Chu Island', 'Lachelein', 'Arcana', 'Morass', 'Esfera'] as const,
	},
	sacred: {
		folder: '/assets/sacredforce/',
		maxLevel: 11,
		names: ['Cernium', 'Arcus', 'Odium', 'Shangri-La', 'Arteria', 'Carcion'] as const,
	},
	grand: {
		folder: '/assets/grandsacredforce/',
		maxLevel: 11,
		names: ['Tallahart'] as const,
	},
} as const;

export type SymbolCategory = keyof typeof SYMBOL_CONFIG;

export type SymbolName = { [C in SymbolCategory]: (typeof SYMBOL_CONFIG)[C]['names'][number] }[SymbolCategory];

type SymbolInfo = {
	category: SymbolCategory;
	file: string;
	minLevel?: number;
	maxLevel: number;
	value: number;
};

export const parseSymbolCategory = (value: string): SymbolCategory | undefined => {
	const key = value.toLowerCase() as keyof typeof SYMBOL_CONFIG;
	if (key in SYMBOL_CONFIG) {
		return key;
	}
	return undefined;
};

const symbolRawMap = new Map(allSymbols.map((s) => [s.name, s]));

const SYMBOL_MAP: Record<SymbolName, SymbolInfo> = Object.fromEntries(
	Object.entries(SYMBOL_CONFIG).flatMap(([category, config]) =>
		config.names.map((name) => {
			const raw = symbolRawMap.get(name);
			return [
				name,
				{
					category: category as SymbolCategory,
					file: name.toLowerCase().replace(/ /g, '_'),
					minLevel: raw?.minLevel ? Number(raw.minLevel) : undefined,
					maxLevel: config.maxLevel,
					value: raw ? Number(raw.value) : 0,
				},
			];
		}),
	),
) as Record<SymbolName, SymbolInfo>;

const contentValueMap = new Map<string, number>(allSymbols.map((s) => [s.name, Number(s.value) || 0]));

export const getSymbolImagePath = (name: SymbolName): string => {
	const info = SYMBOL_MAP[name];
	return `${SYMBOL_CONFIG[info.category].folder}${info.file}.webp`;
};

export const isSymbolName = (value: string): value is SymbolName => value in SYMBOL_MAP;

export const toSymbolName = (value: string): SymbolName | null => (isSymbolName(value) ? value : null);

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
	if (contentType === 'Daily Quest') {
		return SYMBOL_MAP[symbolName].value;
	}
	// Return value of contentType if exists, otherwise fallback to 'Weekly'
	return contentValueMap.get(contentType) ?? contentValueMap.get('Weekly') ?? 0;
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
	const dailyPerWeek = daily * 7;
	const totalPerWeek = dailyPerWeek + weeklyTotal;

	const weeks = Math.floor(remaining / totalPerWeek);
	remaining -= weeks * totalPerWeek;

	let remainingDays = 0;
	while (remaining > 0) {
		remainingDays++;
		remaining -= daily;
		if (remainingDays % 7 === 0) {
			remaining -= weeklyTotal;
		}
	}

	return weeks * 7 + remainingDays;
};

export type LevelUpResult = { currentLevel: number; currentExp: number };

export const calculateNewLevelFromExp = (
	type: SymbolCategory,
	currentLevel: number,
	currentExp: number,
): LevelUpResult => {
	let level = currentLevel;
	let exp = currentExp;
	const maxLevel = getLastLevel(type);

	while (level < maxLevel) {
		const expForNext = getExpForLevel(type, level);
		if (exp >= expForNext) {
			exp -= expForNext;
			level++;
			continue;
		}
		break;
	}

	return { currentLevel: level, currentExp: exp };
};

import { getRemainingExp, getExpForLevel, getLastLevel } from '@data/symbols/exp/expTable';

import { allSymbols } from './dailyExp';

import type { CharacterSymbol as PrismaCharacterSymbol, SymbolCategory } from '@prisma/client';

export type CharacterSymbol = {
	name: string;
	level: number;
	exp: number;
	category: SymbolCategory;
};

export const mapCharacterSymbol = (input: PrismaCharacterSymbol): CharacterSymbol => ({
	name: input.name,
	level: input.level,
	exp: input.exp,
	category: input.category,
});

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
} as const satisfies Record<SymbolCategory, { folder: string; maxLevel: number; names: readonly string[] }>;

export type SymbolName = (typeof SYMBOL_CONFIG)[keyof typeof SYMBOL_CONFIG]['names'][number];

type SymbolInfo = {
	category: SymbolCategory;
	file: string;
	minLevel?: number;
	maxLevel: number;
	value: number;
};

const symbolRawMap = new Map(allSymbols.map((s) => [s.name, s]));
const SYMBOL_MAP: Record<SymbolName, SymbolInfo> = Object.fromEntries(
	(Object.entries(SYMBOL_CONFIG) as [SymbolCategory, (typeof SYMBOL_CONFIG)[SymbolCategory]][]).flatMap(
		([category, config]) =>
			config.names.map((name) => {
				const raw = symbolRawMap.get(name);
				return [
					name,
					{
						category,
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
const SYMBOL_CATEGORY_SET: ReadonlySet<SymbolCategory> = new Set(Object.keys(SYMBOL_CONFIG) as SymbolCategory[]);

export const isSymbolCategory = (value: unknown): value is SymbolCategory =>
	typeof value === 'string' && SYMBOL_CATEGORY_SET.has(value as SymbolCategory);

export const isSymbolName = (value: string): value is SymbolName => value in SYMBOL_MAP;

export const toSymbolName = (value: string): SymbolName | null => (isSymbolName(value) ? value : null);

export const getSymbolImagePath = (name: SymbolName): string => {
	const info = SYMBOL_MAP[name];
	return `${SYMBOL_CONFIG[info.category].folder}${info.file}.webp`;
};

export const canUseSymbol = (level: number, name: SymbolName): boolean => {
	const minLevel = SYMBOL_MAP[name].minLevel;
	return minLevel === undefined || level >= minLevel;
};

export const getSymbolMinLevel = (name: SymbolName): number => SYMBOL_MAP[name].minLevel ?? 0;

export const getSymbolMaxLevel = (input: SymbolCategory | SymbolName): number => {
	if (isSymbolCategory(input)) {
		return SYMBOL_CONFIG[input].maxLevel;
	}
	return SYMBOL_MAP[input].maxLevel;
};

export const getContentValue = (symbolName: SymbolName | null, contentType: string): number => {
	if (!symbolName) {
		return 0;
	}
	if (contentType === 'Daily Quest') {
		return SYMBOL_MAP[symbolName].value;
	}
	return contentValueMap.get(contentType) ?? contentValueMap.get('Weekly') ?? 0;
};

export type CharacterContent = { contentType: string; checked: boolean; cleared: boolean };

export const computeDailyWeeklyValues = (
	symbol: CharacterSymbol,
	content: CharacterContent[],
): { dailyValue: number; weeklyValue: number } => {
	const symbolName = toSymbolName(symbol.name);
	if (!symbolName) {
		return { dailyValue: 0, weeklyValue: 0 };
	}

	const dailyValue =
		(content[0]?.checked ? getContentValue(symbolName, content[0].contentType) : 0) +
		(content[2]?.checked ? getContentValue(symbolName, content[2].contentType) : 0);

	const weeklyValue = content[1]?.checked ? getContentValue(symbolName, 'Weekly') : 0;

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
	if (type === 'arcane') {
		level = Math.min(level, 20);
	} else if ((type === 'sacred' && level >= 11) || (type === 'sacred' && level >= 11)) {
		level = 11;
	}

	return { currentLevel: level, currentExp: exp };
};

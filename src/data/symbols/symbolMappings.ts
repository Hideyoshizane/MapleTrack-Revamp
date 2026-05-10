import { getRemainingExp, getExpForLevel, getLastLevel } from '@data/symbols/exp/expTable';

import { allSymbols } from './dailyExp';

import type { SymbolCategory } from '@prisma/client';

type CharacterSymbol = {
	name: string;
	level: number;
	exp: number;
	category: SymbolCategory;
};

export type SymbolName = (typeof allSymbols)[number]['name'];

type SymbolContent = (typeof allSymbols)[number]['contents'][number];

type SymbolInfo = {
	category: SymbolCategory;
	file: string;
	minLevel: number;
	maxLevel: number;
	contents: SymbolContent[];
};

export const SYMBOL_MAP: Record<SymbolName, SymbolInfo> = Object.fromEntries(
	allSymbols.map((symbol) => [
		symbol.name,
		{
			category: symbol.category,
			file: symbol.name.toLowerCase().replace(/ /g, '_'),
			minLevel: symbol.minLevel,
			maxLevel: symbol.maxLevel,
			contents: symbol.contents,
		},
	]),
) as Record<SymbolName, SymbolInfo>;

const SYMBOL_CATEGORY_FOLDER_MAP: Record<SymbolCategory, string> = {
	arcane: 'arcaneforce',
	sacred: 'sacredforce',
	grand: 'grandsacredforce',
};

export const isSymbolName = (value: string): value is SymbolName => value in SYMBOL_MAP;

export const toSymbolName = (value: string): SymbolName | null => (isSymbolName(value) ? value : null);

export const getSymbolImagePath = (name: SymbolName): string => {
	const info = SYMBOL_MAP[name];
	const folder = SYMBOL_CATEGORY_FOLDER_MAP[info.category];

	return `/assets/${folder}/${info.file}.webp`;
};

export const canUseSymbol = (level: number, name: SymbolName): boolean => {
	return level >= SYMBOL_MAP[name].minLevel;
};

export const getSymbolMinLevel = (name: SymbolName): number => SYMBOL_MAP[name].minLevel;

export const getSymbolMaxLevel = (input: SymbolCategory | SymbolName): number => {
	if (isSymbolName(input)) {
		return SYMBOL_MAP[input].maxLevel;
	}

	const symbols = allSymbols.filter((s) => s.category === input);
	return Math.max(...symbols.map((s) => s.maxLevel));
};

export const getContentValue = (symbolName: SymbolName | null, contentType: string, characterLevel: number): number => {
	if (!symbolName) {
		return 0;
	}

	const symbol = SYMBOL_MAP[symbolName];
	if (!symbol?.contents?.length) {
		return 0;
	}

	if (contentType === 'Weekly') {
		const weeklyContent = symbol.contents.find((content) => {
			const isWeekly = content.type === 'weekly';
			const matchesLevel = content.minLevel ? characterLevel >= content.minLevel : true;

			return isWeekly && matchesLevel;
		});

		return weeklyContent?.value ?? 0;
	}

	const matchedContent = symbol.contents.find((content) => {
		const matchesName = content.name === contentType;
		const matchesLevel = content.minLevel ? characterLevel >= content.minLevel : true;

		return matchesName && matchesLevel;
	});

	return matchedContent?.value ?? 0;
};

export const sortSymbolsByMinLevel = <TSymbol extends { name: string }>(symbols: TSymbol[]): TSymbol[] => {
	return [...symbols].sort((leftSymbol, rightSymbol) => {
		const leftSymbolName = toSymbolName(leftSymbol.name);
		const rightSymbolName = toSymbolName(rightSymbol.name);

		if (!leftSymbolName || !rightSymbolName) {
			return 0;
		}

		return getSymbolMinLevel(leftSymbolName) - getSymbolMinLevel(rightSymbolName);
	});
};

type SortableContent = {
	contentType: string;
};

const getContentOrder = (symbolName: SymbolName, contentType: string): number => {
	const symbol = SYMBOL_MAP[symbolName];

	const index = symbol.contents.findIndex((content) => content.name === contentType);

	return index === -1 ? Number.MAX_SAFE_INTEGER : index;
};

export const sortSymbolContents = <TContent extends SortableContent>(
	symbolName: string,
	contents: TContent[],
): TContent[] => {
	const parsedSymbolName = toSymbolName(symbolName);
	if (!parsedSymbolName) {
		return contents;
	}

	return [...contents].sort((leftContent, rightContent) => {
		const leftOrder = getContentOrder(parsedSymbolName, leftContent.contentType);

		const rightOrder = getContentOrder(parsedSymbolName, rightContent.contentType);

		return leftOrder - rightOrder;
	});
};

type CharacterContent = {
	contentType: string;
	checked: boolean;
	cleared: boolean;
	type: 'daily' | 'weekly';
};

export const computeDailyWeeklyValues = (
	symbol: CharacterSymbol,
	content: CharacterContent[],
	characterLevel: number,
): { dailyValue: number; weeklyValue: number } => {
	const symbolName = toSymbolName(symbol.name);
	if (!symbolName) {
		return { dailyValue: 0, weeklyValue: 0 };
	}

	const symbolInfo = SYMBOL_MAP[symbolName];

	let dailyValue = 0;
	let weeklyValue = 0;

	for (const c of content) {
		if (!c.checked) {
			continue;
		}

		const matchedContent = symbolInfo.contents.find((item) => {
			const matchesName = item.name === c.contentType;
			const matchesLevel = item.minLevel ? characterLevel >= item.minLevel : true;

			return matchesName && matchesLevel;
		});

		if (!matchedContent) {
			continue;
		}

		if (matchedContent.type === 'weekly') {
			weeklyValue += matchedContent.value;
			continue;
		}

		dailyValue += matchedContent.value;
	}

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

		if (exp < expForNext) {
			break;
		}

		exp -= expForNext;
		level++;
	}

	level = type === 'arcane' ? Math.min(level, 20) : Math.min(level, 11);

	return { currentLevel: level, currentExp: exp };
};

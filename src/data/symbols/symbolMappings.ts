import { getRemainingExp, getExpForLevel, getLastLevel } from '@data/symbols/exp/expTable';
import { nowInUtc, getNextMidnight } from '@utils/time';

import { allSymbols } from './dailyExp';

import type { SymbolCategory, SymbolName } from './dailyExp';

type CharacterSymbol = {
	name: string;
	level: number;
	exp: number;
	category: SymbolCategory;
};

type SymbolContent = (typeof allSymbols)[number]['contents'][number];

type SymbolInfo = {
	category: SymbolCategory;
	minLevel: number;
	maxLevel: number;
	contents: readonly SymbolContent[];
};

const SYMBOL_CATEGORY_FOLDER_MAP: Record<SymbolCategory, string> = {
	arcane: 'arcaneforce',
	sacred: 'sacredforce',
	grand: 'grandsacredforce',
};

export const SYMBOL_MAP = Object.fromEntries(
	allSymbols.map((symbol) => [
		symbol.name,
		{
			category: symbol.category,
			minLevel: symbol.minLevel,
			maxLevel: symbol.maxLevel,
			contents: symbol.contents,
		},
	]),
) as Record<string, SymbolInfo>;

export const isSymbolName = (value: string): value is SymbolName => value in SYMBOL_MAP;

export const toSymbolName = (value: string): SymbolName | null => (isSymbolName(value) ? value : null);

const getSymbolInfo = (name: string): SymbolInfo | null => (isSymbolName(name) ? SYMBOL_MAP[name] : null);

const hasRequiredLevel = (minLevel: number | undefined, characterLevel: number): boolean =>
	minLevel === undefined || characterLevel >= minLevel;

const findSymbolContent = (
	symbolName: SymbolName,
	contentName: string,
	characterLevel: number,
): SymbolContent | undefined =>
	SYMBOL_MAP[symbolName].contents.find(
		(content) => content.name === contentName && hasRequiredLevel(content.minLevel, characterLevel),
	);

export const getSymbolImagePath = (name: SymbolName): string => {
	const symbol = SYMBOL_MAP[name];
	const fileName = name.toLowerCase().replaceAll(' ', '_');

	return `/assets/${SYMBOL_CATEGORY_FOLDER_MAP[symbol.category]}/${fileName}.webp`;
};

export const canUseSymbol = (level: number, name: SymbolName): boolean => level >= SYMBOL_MAP[name].minLevel;

export const getSymbolMinLevel = (name: SymbolName): number => SYMBOL_MAP[name].minLevel;

export const getSymbolMaxLevelByCategory = (category: SymbolCategory): number =>
	Math.max(...allSymbols.filter((symbol) => symbol.category === category).map((symbol) => symbol.maxLevel));
export const getContentValue = (symbolName: SymbolName | null, contentType: string, characterLevel: number): number => {
	if (!symbolName) {
		return 0;
	}

	const symbol = getSymbolInfo(symbolName);

	if (!symbol) {
		return 0;
	}

	if (contentType === 'Weekly') {
		return (
			symbol.contents.find(
				(content) => content.type === 'weekly' && hasRequiredLevel(content.minLevel, characterLevel),
			)?.value ?? 0
		);
	}

	return findSymbolContent(symbolName, contentType, characterLevel)?.value ?? 0;
};

export const sortSymbolsByMinLevel = <TSymbol extends { name: string }>(symbols: TSymbol[]): TSymbol[] => {
	return [...symbols].sort((left, right) => {
		const leftSymbol = toSymbolName(left.name);
		const rightSymbol = toSymbolName(right.name);

		if (!leftSymbol || !rightSymbol) {
			return 0;
		}

		return getSymbolMinLevel(leftSymbol) - getSymbolMinLevel(rightSymbol);
	});
};

type SortableContent = {
	contentType: string;
};

export const sortSymbolContents = <TContent extends SortableContent>(
	symbolName: string,
	contents: TContent[],
): TContent[] => {
	const symbol = getSymbolInfo(symbolName);

	if (!symbol) {
		return contents;
	}

	return [...contents].sort((left, right) => {
		const leftIndex = symbol.contents.findIndex((content) => content.name === left.contentType);

		const rightIndex = symbol.contents.findIndex((content) => content.name === right.contentType);

		return (
			(leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex) -
			(rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex)
		);
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

	return content.reduce(
		(result, currentContent) => {
			if (!currentContent.checked) {
				return result;
			}

			const matchedContent = findSymbolContent(symbolName, currentContent.contentType, characterLevel);

			if (!matchedContent) {
				return result;
			}

			if (matchedContent.type === 'weekly') {
				result.weeklyValue += matchedContent.value;
			} else {
				result.dailyValue += matchedContent.value;
			}

			return result;
		},
		{ dailyValue: 0, weeklyValue: 0 },
	);
};

export const calculateDaysToCompleteSymbol = (
	daily: number,
	weekly: number,
	type: SymbolCategory,
	symbolLevel: number,
	symbolExp: number,
	remainingWeeklyTries: number,
	dailyCleared: boolean,
): number => {
	let remainingExp = getRemainingExp(type, symbolLevel, symbolExp);

	if (remainingExp <= 0) {
		return 0;
	}

	if (daily <= 0 && weekly <= 0) {
		return Infinity;
	}

	let currentDate = nowInUtc();
	let daysElapsed = 0;
	let weeklyTries = remainingWeeklyTries;
	let canDoDailyToday = !dailyCleared;

	while (remainingExp > 0) {
		if (canDoDailyToday && daily > 0) {
			remainingExp -= daily;

			if (remainingExp <= 0) {
				break;
			}
		}

		while (weekly > 0 && weeklyTries > 0 && remainingExp > 0) {
			remainingExp -= weekly;
			weeklyTries--;
		}

		if (remainingExp <= 0) {
			break;
		}

		currentDate = getNextMidnight(currentDate);
		daysElapsed++;

		if (currentDate.getUTCDay() === 4) {
			weeklyTries = 3;
		}

		canDoDailyToday = true;
	}

	return daysElapsed;
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
		const expForNext = getExpForLevel(type, level);

		if (exp < expForNext) {
			break;
		}

		exp -= expForNext;
		level++;
	}

	return { currentLevel: Math.min(level, type === 'arcane' ? 20 : 11), currentExp: exp };
};

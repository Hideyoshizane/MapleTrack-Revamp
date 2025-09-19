import { getRemainingExp } from '@data/symbols/exp/expTable';
import { CharacterSymbol, CharacterContent } from '@models/character';

import { allSymbols } from './dailyExp';

// Symbol Name Types
export type ArcaneSymbolName = 'Vanishing Journey' | 'Chu Chu Island' | 'Lachelein' | 'Arcana' | 'Morass' | 'Esfera';
export type SacredSymbolName = 'Cernium' | 'Arcus' | 'Odium' | 'Shangri-La' | 'Arteria' | 'Carcion';
export type GrandSacredSymbolName = 'Tallahart';
export type SymbolCategory = 'arcane' | 'sacred' | 'grand';
export type SymbolName = ArcaneSymbolName | SacredSymbolName | GrandSacredSymbolName;

// Maps category to names
const SYMBOL_NAMES: Record<SymbolCategory, readonly string[]> = {
	arcane: ['Vanishing Journey', 'Chu Chu Island', 'Lachelein', 'Arcana', 'Morass', 'Esfera'],
	sacred: ['Cernium', 'Arcus', 'Odium', 'Shangri-La', 'Arteria', 'Carcion'],
	grand: ['Tallahart'],
} as const;

// Category max levels
export const CATEGORY_MAX_LEVEL: Record<SymbolCategory, number> = {
	arcane: 20,
	sacred: 11,
	grand: 11,
};

// Folder map for assets
const FOLDER_MAP: Record<SymbolCategory, string> = {
	arcane: '/assets/arcaneforce/',
	sacred: '/assets/sacredforce/',
	grand: '/assets/grandsacredforce/',
};

// Symbol Info
interface SymbolInfo {
	category: SymbolCategory;
	file: string;
	minLevel?: number;
	maxLevel: number;
}

// Build a single lookup map
const SYMBOL_MAP: Record<SymbolName, SymbolInfo> = Object.fromEntries(
	Object.entries(SYMBOL_NAMES).flatMap(([category, names]) =>
		names.map((name) => {
			const symbol = allSymbols.find((s) => s.name === name);
			return [
				name,
				{
					category: category as SymbolCategory,
					file: name.toLowerCase().replace(/ /g, '_'),
					minLevel: symbol?.minLevel ? parseInt(symbol.minLevel, 10) : undefined,
					maxLevel: CATEGORY_MAX_LEVEL[category as SymbolCategory],
				},
			];
		})
	)
) as Record<SymbolName, SymbolInfo>;

// Get symbol image path
export const getSymbolImagePath = (name: SymbolName): string => {
	const symbol = SYMBOL_MAP[name];
	return `${FOLDER_MAP[symbol.category]}${symbol.file}.webp`;
};

// Check if character can use symbol
export const canUseSymbol = (level: number, name: string): boolean => {
	const symbol = SYMBOL_MAP[name as SymbolName];
	if (!symbol) return false;
	if (!symbol.minLevel) return true;
	return level >= symbol.minLevel;
};

// Get symbol min level
export const getSymbolMinLevel = (name: string): number => SYMBOL_MAP[name as SymbolName]?.minLevel ?? 0;

// Get max level (by name or category)
export const getSymbolMaxLevel = (input: SymbolCategory | SymbolName): number =>
	input in CATEGORY_MAX_LEVEL ? CATEGORY_MAX_LEVEL[input as SymbolCategory] : SYMBOL_MAP[input as SymbolName].maxLevel;

// Get symbol value
export const getContentValue = (symbolName: string, contentType: string): number => {
	// Helper to resolve values safely
	const resolve = (name: string): number => {
		const symbol = allSymbols.find((s) => s.name === name);
		return symbol ? Number(symbol.value) || 0 : 0;
	};

	if (contentType === 'Daily Quest') return resolve(symbolName);

	const value = resolve(contentType);
	return value !== 0 ? value : resolve('Weekly');
};
// Compute daily and weekly values
export const computeDailyWeeklyValues = (
	symbol: CharacterSymbol,
	content: CharacterContent[]
): { dailyValue: number; weeklyValue: number } => {
	const dailyValue =
		(content[0]?.checked ? getContentValue(symbol.name, content[0].contentType) : 0) +
		(content[2]?.checked ? getContentValue(symbol.name, content[2].contentType) : 0);

	// Weekly value comes from second content item
	const weeklyValue = content[1]?.checked ? getContentValue(symbol.name, 'Weekly') : 0;

	return { dailyValue, weeklyValue };
};

// Return Days to max Symbol
export const calculateDaysToCompleteSymbol = (
	daily: number,
	weekly: number,
	type: SymbolCategory,
	symbolLevel: number,
	symbolExp: number
): number => {
	let remaining = getRemainingExp(type, symbolLevel, symbolExp);
	if (remaining <= 0) return 0;
	if (daily <= 0 && weekly <= 0) return Infinity;

	// total weekly gain
	const weeklyTotal = weekly * 3;

	const dailyGainPerWeek = daily * 7;

	const totalExpPerWeek = dailyGainPerWeek + weeklyTotal;

	// calculate full weeks needed
	const weeksNeeded = Math.floor(remaining / totalExpPerWeek);
	remaining -= weeksNeeded * totalExpPerWeek;

	// remaining days in last partial week
	let remainingDays = 0;
	while (remaining > 0) {
		remainingDays++;
		remaining -= daily;
		if (remainingDays % 7 === 0) remaining -= weeklyTotal;
	}

	return weeksNeeded * 7 + remainingDays;
};

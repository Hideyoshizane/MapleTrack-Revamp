import raw from './dailyExp.json';

export const SYMBOL_CATEGORIES = ['arcane', 'sacred', 'grand'] as const;

export type SymbolCategory = (typeof SYMBOL_CATEGORIES)[number];

export type SymbolContent = {
	name: string;
	value: number;
	minLevel?: number;
	type?: 'daily' | 'weekly';
};

export type SymbolData = {
	name: string;
	category: SymbolCategory;
	minLevel: number;
	maxLevel: number;
	contents: SymbolContent[];
};

export type SymbolsData = {
	symbols: SymbolData[];
	weekly: { value: number };
};

const symbolsData = raw as SymbolsData;

export const allSymbols = symbolsData.symbols;

export type SymbolName = SymbolData['name'];

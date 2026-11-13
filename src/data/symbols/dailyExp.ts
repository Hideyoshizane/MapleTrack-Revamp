import raw from './dailyExp.json';

export const SYMBOL_CATEGORIES = ['arcane', 'sacred', 'grand'] as const;

export type SymbolCategory = (typeof SYMBOL_CATEGORIES)[number];

export type SymbolContent = { name: string; value: number; minLevel?: number; type?: 'daily' | 'weekly' };

export type SymbolData = {
	name: string;
	category: SymbolCategory;
	minLevel: number;
	maxLevel: number;
	contents: SymbolContent[];
};

export type SymbolsData = { symbols: SymbolData[]; weekly: { value: number } };

const symbolsData = raw as SymbolsData;

export const allSymbols = symbolsData.symbols;

export type SymbolName = SymbolData['name'];

const symbolContentTypes = new Map(
	allSymbols.flatMap((symbol) => symbol.contents.map((content) => [content.name, content.type] as const)),
);

export const getSymbolContentType = (contentName: string): 'daily' | 'weekly' | undefined =>
	symbolContentTypes.get(contentName);

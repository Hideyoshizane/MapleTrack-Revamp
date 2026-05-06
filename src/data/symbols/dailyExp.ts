import raw from './dailyExp.json';

import type { SymbolCategory } from '@prisma/client';

type RawContent = {
	name: string;
	value: number;
	minLevel?: number;
	type?: 'daily' | 'weekly';
};

type RawSymbol = {
	name: string;
	category: SymbolCategory;
	minLevel: number;
	maxLevel: number;
	contents: RawContent[];
};

type SymbolsJson = {
	symbols: RawSymbol[];
	weekly: {
		value: number;
	};
};

const symbolsData = raw as SymbolsJson;

export const allSymbols = symbolsData.symbols;

import symbolsData from '@data/symbols/dailyExp.json';

type RawSymbol = {
	name: string;
	value: string;
	minLevel?: string;
};

export const allSymbols: RawSymbol[] = symbolsData as RawSymbol[];

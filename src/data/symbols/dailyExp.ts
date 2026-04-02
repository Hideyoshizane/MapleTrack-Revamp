import symbolsData from '@data/symbols/dailyExp.json';

type RawSymbol = {
	name: string;
	value: string;
	minLevel?: string;
};

export const allSymbols: RawSymbol[] = symbolsData as RawSymbol[];

const symbolsMap: ReadonlyMap<string, RawSymbol> = new Map(
	allSymbols.map((symbol): [string, RawSymbol] => [symbol.name, symbol]),
);

export const getSymbolByName = (name: string): RawSymbol | undefined => symbolsMap.get(name);

export const getSymbolValueByName = (name: string): number => {
	const symbol = symbolsMap.get(name);
	return symbol ? Number(symbol.value) : 0;
};

export const getSymbolMinLevelByName = (name: string): number => {
	const symbol = symbolsMap.get(name);
	return symbol && symbol.minLevel ? Number(symbol.minLevel) : 0;
};

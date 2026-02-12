import type { LevelUpResult } from '@data/symbols/symbolMappings';
import type { CharacterSymbol } from '@features/character/characterModel';

export const applySymbolUpdates = (
	symbols: CharacterSymbol[],
	updates: Record<string, LevelUpResult>
): CharacterSymbol[] => {
	return symbols.map((symbol) => {
		const update = updates[symbol.name];

		if (!update) {
			return symbol;
		}

		return {
			...symbol,
			level: update.currentLevel,
			exp: update.currentExp,
		};
	});
};

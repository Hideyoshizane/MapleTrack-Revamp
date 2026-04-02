import { SYMBOL_CONFIG } from '@data/symbols/symbolMappings';

import type { CharacterSymbolDraft, CharacterDraft } from './characterModel';
import type { SymbolCategory } from '@data/symbols/symbolMappings';

type JobClassLevel = 'No Job' | '1st Class' | '2nd Class' | '3rd Class' | '4th Class' | 'V Class' | 'VI Class';

export const getJob = (level: number): JobClassLevel => {
	if (level >= 260) return 'VI Class';
	if (level >= 200) return 'V Class';
	if (level >= 100) return '4th Class';
	if (level >= 60) return '3rd Class';
	if (level >= 30) return '2nd Class';
	if (level >= 1) return '1st Class';
	return 'No Job';
};

export const separateSymbolsByCategory = (
	symbols: CharacterSymbolDraft[],
): Record<SymbolCategory, { name: string; level: number; maxLevel: number }[]> => {
	const result: Record<SymbolCategory, { name: string; level: number; maxLevel: number }[]> = {
		arcane: [],
		sacred: [],
		grand: [],
	};

	for (const symbol of symbols) {
		const maxLevel = SYMBOL_CONFIG[symbol.category].maxLevel;
		result[symbol.category].push({ name: symbol.name, level: symbol.level, maxLevel });
	}

	return result;
};

export type SymbolSection = {
	type: SymbolCategory;
	title: string;
	symbols: CharacterSymbolDraft[];
};

export const getCharacterSymbolSections = (character: CharacterDraft): SymbolSection[] => {
	const grouped: Record<SymbolCategory, CharacterSymbolDraft[]> = {
		arcane: [],
		sacred: [],
		grand: [],
	};

	for (const symbol of character.symbols ?? []) {
		grouped[symbol.category].push(symbol);
	}

	return (Object.keys(SYMBOL_CONFIG) as SymbolCategory[]).map((type) => ({
		type,
		title: `${type.charAt(0).toUpperCase() + type.slice(1)} Symbols`,
		symbols: grouped[type],
	}));
};

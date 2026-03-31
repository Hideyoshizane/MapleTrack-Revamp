import type { CharacterSymbolDraft, CharacterDraft } from './characterModel';
import type { SymbolCategory } from '@data/symbols/symbolMappings';

type JobClass = 'No Job' | '1st Class' | '2nd Class' | '3rd Class' | '4th Class' | 'V Class' | 'VI Class';

const jobThresholds: { min: number; job: JobClass }[] = [
	{ min: 0, job: 'No Job' },
	{ min: 1, job: '1st Class' },
	{ min: 30, job: '2nd Class' },
	{ min: 60, job: '3rd Class' },
	{ min: 100, job: '4th Class' },
	{ min: 200, job: 'V Class' },
	{ min: 260, job: 'VI Class' },
];

export const getJob = (level: number): JobClass => {
	let result: JobClass = 'No Job';

	for (const threshold of jobThresholds) {
		if (level < threshold.min) {
			break;
		}
		result = threshold.job;
	}

	return result;
};

export type Rank = 'rank_b' | 'rank_a' | 'rank_s' | 'rank_ss' | 'rank_sss' | 'no_rank';

type LegionThreshold = { min: number; rank: Rank };

export type LegionThresholdSetCode = 'zero' | 'default';

const LegionThresholds = {
	zero: [
		{ min: 130, rank: 'rank_b' },
		{ min: 160, rank: 'rank_a' },
		{ min: 180, rank: 'rank_s' },
		{ min: 200, rank: 'rank_ss' },
		{ min: 250, rank: 'rank_sss' },
	],
	default: [
		{ min: 60, rank: 'rank_b' },
		{ min: 100, rank: 'rank_a' },
		{ min: 140, rank: 'rank_s' },
		{ min: 200, rank: 'rank_ss' },
		{ min: 250, rank: 'rank_sss' },
	],
} as const satisfies Record<LegionThresholdSetCode, readonly LegionThreshold[]>;

export const getRank = (level: number, code?: LegionThresholdSetCode): Rank => {
	if (!code) {
		return 'no_rank';
	}

	const set = LegionThresholds[code === 'zero' ? 'zero' : 'default'];

	let result: Rank = 'no_rank';

	for (const threshold of set) {
		if (level < threshold.min) {
			break;
		}
		result = threshold.rank;
	}

	return result;
};

export const codeToLegionThresholdSet = (code: string): LegionThresholdSetCode => {
	return code === 'zero' ? 'zero' : 'default';
};

const CLASS_EXCEPTIONS = {
	ice_lightning: 'Ice & Lightning',
	fire_poison: 'Fire & Poison',
};

export const codeToClass = (code: string): string => {
	const exception = CLASS_EXCEPTIONS[code as keyof typeof CLASS_EXCEPTIONS];

	if (exception) {
		return exception;
	}

	return code.replace(/_/g, ' ').replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
};

export const separateSymbolsByCategory = (
	symbols: CharacterSymbolDraft[],
): Record<SymbolCategory, { name: string; level: number }[]> => {
	const result: Record<SymbolCategory, { name: string; level: number }[]> = {
		arcane: [],
		sacred: [],
		grand: [],
	};

	for (const symbol of symbols) {
		result[symbol.category].push({ name: symbol.name, level: symbol.level });
	}

	return result;
};

export type SymbolSection = {
	type: SymbolCategory;
	title: string;
	symbols: CharacterSymbolDraft[];
};

const createEmptySymbolGroups = (): Record<SymbolCategory, CharacterSymbolDraft[]> => ({
	arcane: [],
	sacred: [],
	grand: [],
});

export const getCharacterSymbolSections = (character: CharacterDraft): SymbolSection[] => {
	const grouped = createEmptySymbolGroups();

	for (const symbol of character.symbols ?? []) {
		grouped[symbol.category].push(symbol);
	}

	return [
		{ type: 'arcane', title: 'Arcane Symbols', symbols: grouped.arcane },
		{ type: 'sacred', title: 'Sacred Symbols', symbols: grouped.sacred },
		{ type: 'grand', title: 'Grand Sacred Symbols', symbols: grouped.grand },
	];
};

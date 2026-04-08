import type {
	getAllCharactersResponseBody,
	getEditCharacterDataResponseBody,
	getCharacterDataSymbolsResponseBody,
	getCharacterDataResponseBody,
} from './schemas/character.response.schema';
import type { SymbolCategory } from '@prisma/client';

type SymbolContent = {
	contentType: string;
	checked: boolean;
	cleared: boolean;
};

type SymbolData = {
	id: string;
	name: string;
	level: number;
	exp: number;
	category: SymbolCategory;
	contents: SymbolContent[];
};

type SymbolTemplate = Omit<SymbolData, 'id'>;

type ReturnSymbolWithId = {
	arcane: getCharacterDataSymbolsResponseBody[];
	sacred: getCharacterDataSymbolsResponseBody[];
	grand: getCharacterDataSymbolsResponseBody[];
};

type ReturnSymbolTemplate = {
	arcane: SymbolTemplate[];
	sacred: SymbolTemplate[];
	grand: SymbolTemplate[];
};

const generateSymbol = (
	name: string,
	category: SymbolCategory,
	contents: string[] = [],
	overrides: Partial<SymbolTemplate> = {},
): SymbolTemplate => ({
	name,
	level: 1,
	exp: 1,
	category,
	contents: contents.map((type) => ({ contentType: type, checked: type === DAILY, cleared: false })),
	...overrides,
});

const DAILY = 'Daily Quest';

const SYMBOL_TEMPLATES = {
	arcane: [
		generateSymbol('Vanishing Journey', 'arcane', [DAILY, 'Erda Spectrum', 'Reverse City']),
		generateSymbol('Chu Chu Island', 'arcane', [DAILY, 'Hungry Muto', 'Yum Yum Island']),
		generateSymbol('Lachelein', 'arcane', [DAILY, 'Midnight Chaser']),
		generateSymbol('Arcana', 'arcane', [DAILY, 'Spirit Savior']),
		generateSymbol('Morass', 'arcane', [DAILY, 'Ranheim Defense']),
		generateSymbol('Esfera', 'arcane', [DAILY, 'Esfera Guardian']),
	],
	sacred: ['Cernium', 'Arcus', 'Odium', 'Shangri-La', 'Arteria', 'Carcion'].map((name) =>
		generateSymbol(name, 'sacred', [DAILY]),
	),
	grand: [generateSymbol('Tallahart', 'grand', [DAILY])],
};

const mapToTemplate = (template: SymbolTemplate): SymbolTemplate => ({
	...template,
	category: template.category,
	contents: template.contents.map((c) => ({ ...c })),
});

export function createSymbolTemplates(includeGrand: boolean): ReturnSymbolTemplate {
	return {
		arcane: SYMBOL_TEMPLATES.arcane.map(mapToTemplate),
		sacred: SYMBOL_TEMPLATES.sacred.map(mapToTemplate),
		grand: includeGrand ? SYMBOL_TEMPLATES.grand.map(mapToTemplate) : [],
	};
}

export function createSymbolsWithIds(includeGrand: boolean): ReturnSymbolWithId {
	const addId = (template: SymbolTemplate): getCharacterDataSymbolsResponseBody =>
		({ id: '', ...mapToTemplate(template) }) as getCharacterDataSymbolsResponseBody;

	return {
		arcane: SYMBOL_TEMPLATES.arcane.map(addId),
		sacred: SYMBOL_TEMPLATES.sacred.map(addId),
		grand: includeGrand ? SYMBOL_TEMPLATES.grand.map(addId) : [],
	};
}

type GenerateCharacterOptions = {
	jobClassName: string;
	jobType: string;
	legion: string;
	linkSkill: string;
};

export const generateCharacterObjectHomePage = (options: GenerateCharacterOptions): getAllCharactersResponseBody => {
	const allTemplates = createSymbolTemplates(false);

	return {
		name: 'Character Name',
		level: 0,
		targetLevel: 10,
		class: options.jobClassName,
		jobType: options.jobType,
		legion: options.legion,
		linkSkill: options.linkSkill,
		bossing: false,
		symbols: {
			arcane: allTemplates.arcane,
			sacred: allTemplates.sacred,
			grand: [],
		},
	} as getAllCharactersResponseBody;
};

export function generateCharacterObjectCharacterPage(options: GenerateCharacterOptions): getCharacterDataResponseBody {
	return {
		id: '',
		name: 'Character Name',
		level: 0,
		targetLevel: 10,
		class: options.jobClassName,
		jobType: options.jobType,
		legion: options.legion,
		linkSkill: options.linkSkill,
		bossing: false,
		syncing: false,
		symbols: createSymbolsWithIds(true),
	};
}

export function generateCharacterObjectEditCharacterPage(
	options: GenerateCharacterOptions,
): getEditCharacterDataResponseBody {
	return {
		id: '',
		name: 'Character Name',
		level: 0,
		targetLevel: 10,
		class: options.jobClassName,
		jobType: options.jobType,
		legion: options.legion,
		linkSkill: options.linkSkill,
		bossing: false,
		syncing: false,
		symbols: createSymbolTemplates(true),
	};
}

export const groupSymbolsByCategory = (
	symbols: getCharacterDataSymbolsResponseBody[],
): Record<SymbolCategory, getCharacterDataSymbolsResponseBody[]> => {
	return symbols.reduce<Record<SymbolCategory, getCharacterDataSymbolsResponseBody[]>>(
		(acc, symbol) => {
			const cat = symbol.category as SymbolCategory;
			if (acc[cat]) {
				acc[cat].push(symbol);
			}
			return acc;
		},
		{ arcane: [], sacred: [], grand: [] },
	);
};

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

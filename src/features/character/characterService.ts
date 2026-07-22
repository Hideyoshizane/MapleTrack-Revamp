import { SYMBOL_MAP } from '@data/symbols/symbolMappings';

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

type ReturnSymbolWithId = Record<SymbolCategory, getCharacterDataSymbolsResponseBody[]>;
type ReturnSymbolTemplate = Record<SymbolCategory, SymbolTemplate[]>;

const DAILY = 'Daily Quest';

const createSymbolTemplate = (name: string, info: (typeof SYMBOL_MAP)[string]): SymbolTemplate => ({
	name,
	level: 1,
	exp: 1,
	category: info.category,
	contents: info.contents.map((c) => ({ contentType: c.name, checked: c.name === DAILY, cleared: false })),
});

const buildTemplates = (): ReturnSymbolTemplate => {
	const grouped: ReturnSymbolTemplate = { arcane: [], sacred: [], grand: [] };

	for (const [name, info] of Object.entries(SYMBOL_MAP)) {
		grouped[info.category].push(createSymbolTemplate(name, info));
	}

	return grouped;
};

const cloneTemplate = (template: SymbolTemplate): SymbolTemplate => ({
	...template,
	contents: template.contents.map((c) => ({ ...c })),
});

const createSymbolTemplates = (includeGrand: boolean): ReturnSymbolTemplate => {
	const templates = buildTemplates();

	return {
		arcane: templates.arcane.map(cloneTemplate),
		sacred: templates.sacred.map(cloneTemplate),
		grand: includeGrand ? templates.grand.map(cloneTemplate) : [],
	};
};

const createSymbolsWithIds = (includeGrand: boolean): ReturnSymbolWithId => {
	const templates = createSymbolTemplates(includeGrand);

	const withId = (t: SymbolTemplate): getCharacterDataSymbolsResponseBody => ({ id: '', ...t });

	return {
		arcane: templates.arcane.map(withId),
		sacred: templates.sacred.map(withId),
		grand: templates.grand.map(withId),
	};
};

type GenerateCharacterOptions = {
	jobClassName: string;
	jobType: string;
	legion: string;
	linkSkill: string;
};

export const generateCharacterObjectHomePage = (options: GenerateCharacterOptions): getAllCharactersResponseBody => {
	const templates = createSymbolTemplates(false);

	return {
		name: 'Character Name',
		level: 0,
		targetLevel: 10,
		class: options.jobClassName,
		jobType: options.jobType,
		legion: options.legion,
		linkSkill: options.linkSkill,
		lastSymbolDaily: null,
		bossing: false,
		symbols: { arcane: templates.arcane, sacred: templates.sacred, grand: [] },
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
		lastSymbolDaily: null,
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
		symbols: createSymbolsWithIds(true),
		lastSymbolDaily: null,
	};
}

const SYMBOL_CATEGORIES: ReadonlySet<SymbolCategory> = new Set(['arcane', 'sacred', 'grand']);

const isSymbolCategory = (value: string): value is SymbolCategory => SYMBOL_CATEGORIES.has(value as SymbolCategory);

export const groupSymbolsByCategory = (
	symbols: getCharacterDataSymbolsResponseBody[],
): Record<SymbolCategory, getCharacterDataSymbolsResponseBody[]> =>
	symbols.reduce<Record<SymbolCategory, getCharacterDataSymbolsResponseBody[]>>(
		(acc, symbol) => {
			if (isSymbolCategory(symbol.category)) {
				acc[symbol.category].push(symbol);
			}
			return acc;
		},
		{ arcane: [], sacred: [], grand: [] },
	);

type JobClassLevel = 'No Job' | '1st Class' | '2nd Class' | '3rd Class' | '4th Class' | 'V Class' | 'VI Class';

export const getJob = (level: number): JobClassLevel => {
	if (level >= 260) {
		return 'VI Class';
	}
	if (level >= 200) {
		return 'V Class';
	}
	if (level >= 100) {
		return '4th Class';
	}
	if (level >= 60) {
		return '3rd Class';
	}
	if (level >= 30) {
		return '2nd Class';
	}
	if (level >= 1) {
		return '1st Class';
	}
	return 'No Job';
};

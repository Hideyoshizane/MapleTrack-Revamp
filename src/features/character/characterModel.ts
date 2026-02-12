import type {
	CharacterSymbol as PrismaCharacterSymbol,
	CharacterContent as PrismaCharacterContent,
	SymbolCategory,
} from '@prisma/client';

export { SymbolCategory };

export type CharacterContentDraft = Omit<PrismaCharacterContent, 'id' | 'symbolId' | 'tries' | 'date'> & {
	tries?: number | null;
	date?: Date | null;
};
export type CharacterSymbolDraft = Omit<PrismaCharacterSymbol, 'id' | 'characterId'> & {
	content: CharacterContentDraft[];
};

export type CharacterContent = PrismaCharacterContent;
export type CharacterSymbol = PrismaCharacterSymbol & {
	content: CharacterContent[];
};

export type CharacterDraft = {
	name: string;
	level: number;
	targetLevel: number;

	class: string | null;
	code: string | null;
	jobType: string | null;
	legion: string | null;
	linkSkill: string | null;
	server: string | null;
	lastUpdate: Date | null;

	bossing: boolean;
	syncing: boolean;

	symbols: CharacterSymbolDraft[];
};

import type {
	Character as PrismaCharacter,
	CharacterSymbol as PrismaCharacterSymbol,
	CharacterContent as PrismaCharacterContent,
} from '@prisma/client';

export type CharacterContent = PrismaCharacterContent;

export type CharacterSymbol = PrismaCharacterSymbol & {
	content: CharacterContent[];
};

export type Character = PrismaCharacter & {
	symbols: CharacterSymbol[];
};

export type CharacterContentDraft = Pick<PrismaCharacterContent, 'id' | 'checked'>;

export type CharacterSymbolEntity = PrismaCharacterSymbol & {
	content: CharacterContent[];
};

export type CharacterSymbolDraft = {
	id: string;
	level: number;
	exp: number;
	content: CharacterContentDraft[];
};

export type CharacterDraft = {
	name: string;
	level: number;
	targetLevel: number;

	class: string | null;
	jobType: string | null;
	legion: string | null;
	linkSkill: string | null;
	server: string | null;
	lastUpdate: Date | null;

	bossing: boolean;
	syncing: boolean;

	symbols: CharacterSymbolDraft[];
};

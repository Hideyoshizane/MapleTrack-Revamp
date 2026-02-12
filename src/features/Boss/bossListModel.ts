import type {
	Boss as PrismaBoss,
	BossCharacter as PrismaBossCharacter,
	BossServer as PrismaBossServer,
	BossList as PrismaBossList,
	BossReset,
} from '@prisma/client';

export { BossReset };

export type BossListDraft = Omit<PrismaBossList, 'id' | 'servers'> & {
	servers: BossServerDraft[];
};

export type BossServerDraft = Omit<PrismaBossServer, 'id' | 'bossListId' | 'characters'> & {
	characters: BossCharacterDraft[];
};

export type BossCharacterDraft = Omit<PrismaBossCharacter, 'id' | 'serverId' | 'bosses'> & {
	bosses: BossDraft[];
};

export type BossDraft = Omit<PrismaBoss, 'id' | 'characterId'>;

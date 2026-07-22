import { z } from 'zod';

import { serverSchema, characterIdRawSchema } from '@features/character/schemas/character.schema';

import {
	astraQuestNameSchema,
	questTypeSchema,
	genesisBossNameSchema,
	destinyBossNameSchema,
} from './liberation.response.schema';

export const getLiberationListRequestSchema = z
	.object({
		server: serverSchema,
	})
	.strict();

export type getLiberationListRequestBody = z.infer<typeof getLiberationListRequestSchema>;

export const getCheckedBossesListRequestSchema = z
	.object({
		server: serverSchema,
		type: questTypeSchema,
		characterId: characterIdRawSchema,
		requestDate: z.coerce.date(),
	})
	.strict();

export type getCheckedBossesListRequesBody = z.infer<typeof getCheckedBossesListRequestSchema>;

export const updateLiberationCharacterRequestSchema = z
	.object({
		characterId: characterIdRawSchema,

		currentGenesisQuest: genesisBossNameSchema,
		currentGenesisPoints: z.number().min(0),
		genesisPass: z.boolean(),
		liberated: z.boolean(),

		currentDestinyQuest: destinyBossNameSchema,
		currentDestinyPoints: z.number().min(0),

		currentAstraQuest: astraQuestNameSchema,
		currentAstraVestigesPoints: z.number().min(0),
		currentAstraTracesPoints: z.number().min(0),
	})
	.strict();

export type updateLiberationCharacterRequestBody = z.infer<typeof updateLiberationCharacterRequestSchema>;

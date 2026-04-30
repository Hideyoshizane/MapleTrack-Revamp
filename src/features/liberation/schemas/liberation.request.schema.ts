import { z } from 'zod';

import { serverSchema, characterIdRawSchema } from '@features/character/schemas/character.schema';

import { questTypeSchema, genesisBossNameSchema, destinyBossNameSchema } from './liberation.response.schema';

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
		currentDestinyQuest: destinyBossNameSchema,
		currentDestinyPoints: z.number().min(0),
		genesisPass: z.boolean(),
		liberated: z.boolean(),
	})
	.strict();

export type updateLiberationCharacterRequestBody = z.infer<typeof updateLiberationCharacterRequestSchema>;

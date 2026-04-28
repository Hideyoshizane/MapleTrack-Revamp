import { z } from 'zod';

import { serverSchema, characterIdRawSchema } from '@features/character/schemas/character.schema';

import { questTypeSchema, bossNameSchema } from './liberation.response.schema';

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
		type: questTypeSchema,

		currentQuest: bossNameSchema,
		currentPoints: z.number().min(0),
		genesisPass: z.boolean().optional(),
		liberated: z.boolean().optional(),
	})
	.strict();

export type updateLiberationCharacterRequestBody = z.infer<typeof updateLiberationCharacterRequestSchema>;

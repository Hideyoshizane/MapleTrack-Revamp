import { z } from 'zod';

import { CHARACTER_MAX_LEVEL } from '@data/character/constants';
import { JOB_CLASSES } from '@data/classes/classes';
import {
	bossNamesPoints,
	bossDifficultyWithSkip,
	isValidBossDifficultyOrSkip,
} from '@data/liberation/liberationBosses';
import { questTypes, bossNames } from '@data/liberation/liberationQuests';
import { characterIdRawSchema, characterNameRawSchema } from '@features/character/schemas/character.schema';

const IdRawSchema = z
	.string()
	.regex(/^[a-fA-F0-9]{24}$/, 'Invalid MongoDB ObjectId')
	.or(z.literal(''));

export const questTypeSchema = z.enum(questTypes);
export const bossNameSchema = z.enum(bossNames);

const getLiberationListCharacterResponseSchema = z
	.object({
		id: IdRawSchema,
		characterId: characterIdRawSchema,
		name: characterNameRawSchema,
		class: z.enum(JOB_CLASSES),
		level: z.number().min(0).max(CHARACTER_MAX_LEVEL),

		type: questTypeSchema,
		currentQuest: bossNameSchema,
		currentPoints: z.number().min(0),
		genesisPass: z.boolean().optional(),
		liberated: z.boolean().optional(),
	})
	.strict();

export type GetLiberationListCharacterResponseBody = z.infer<typeof getLiberationListCharacterResponseSchema>;

export const getLiberationListResponseSchema = z
	.object({
		liberationLastUpdate: z.date(),
		characters: z.array(getLiberationListCharacterResponseSchema),
	})
	.strict();

export type getLiberationListResponseBody = z.infer<typeof getLiberationListResponseSchema>;

export const checkedBossSchema = z
	.object({
		name: z.enum(bossNamesPoints),
		type: z.enum(bossDifficultyWithSkip),
	})
	.superRefine((data, ctx): void => {
		if (!isValidBossDifficultyOrSkip(data.name, data.type)) {
			ctx.addIssue({ code: 'custom', message: 'Invalid difficulty.', path: ['difficulty'] });
		}
	})
	.strict();

export type checkedBossResponseBody = z.infer<typeof checkedBossSchema>;

export const getCheckedBossesListResponseSchema = z.array(checkedBossSchema);

export type getCheckedBossesListResponseBody = z.infer<typeof getCheckedBossesListResponseSchema>;

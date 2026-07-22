import { z } from 'zod';

import { CHARACTER_MAX_LEVEL } from '@data/character/constants';
import { JOB_CLASSES } from '@data/classes/classes';
import {
	getBossMaxPartySize,
	bossNamesPoints,
	bossDifficultyWithSkip,
	isValidBossDifficultyOrSkip,
} from '@data/liberation/liberationBosses';
import { questTypes, genesisBosses, destinyBosses, astraQuests } from '@data/liberation/liberationQuests';
import { characterIdRawSchema, characterNameRawSchema } from '@features/character/schemas/character.schema';

const IdRawSchema = z
	.string()
	.regex(/^[a-fA-F0-9]{24}$/, 'Invalid MongoDB ObjectId')
	.or(z.literal(''));

export const questTypeSchema = z.enum(questTypes);
export const genesisBossNameSchema = z.enum(genesisBosses);
export const destinyBossNameSchema = z.enum(destinyBosses);
export const astraQuestNameSchema = z.enum(astraQuests);

const getLiberationListCharacterResponseSchema = z
	.object({
		id: IdRawSchema,
		characterId: characterIdRawSchema,
		name: characterNameRawSchema,
		class: z.enum(JOB_CLASSES),
		level: z.number().min(0).max(CHARACTER_MAX_LEVEL),

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
		cleared: z.boolean(),
		partySize: z.number().int().min(1),
	})
	.superRefine((data, ctx): void => {
		if (!isValidBossDifficultyOrSkip(data.name, data.type)) {
			ctx.addIssue({ code: 'custom', message: 'Invalid difficulty.', path: ['difficulty'] });
		}

		const maxPartySize = getBossMaxPartySize(data.name);

		if (data.partySize > maxPartySize) {
			ctx.addIssue({
				code: 'custom',
				path: ['partySize'],
				message: `Party size cannot exceed ${maxPartySize} for ${data.name}.`,
			});
		}
	})
	.strict();

export type checkedBossResponseBody = z.infer<typeof checkedBossSchema>;

export const getCheckedBossesListResponseSchema = z.array(checkedBossSchema);

export type getCheckedBossesListResponseBody = z.infer<typeof getCheckedBossesListResponseSchema>;

export const updateLiberationCharacterResponseSchema = z
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

export type updateLiberationCharacterResponseBody = z.infer<typeof updateLiberationCharacterResponseSchema>;

import { z } from 'zod';

import { BOSS_DIFFICULTY_ENUM, BOSS_RESET_ENUM, BOSS_NAMES_ENUM, isValidBossDifficulty } from '@data/bosses/bosses';
import { CHARACTER_MAX_LEVEL } from '@data/character/constants';
import { JOB_CLASSES } from '@data/classes/classes';
import { characterIdRawSchema, characterNameRawSchema } from '@features/character/schemas/character.schema';

export const IdRawSchema = z
	.string()
	.regex(/^[a-fA-F0-9]{24}$/, 'Invalid MongoDB ObjectId')
	.or(z.literal(''));

// Weekly boss page

const getBossListBossesSchema = z
	.object({
		id: IdRawSchema,
		name: z.enum(BOSS_NAMES_ENUM),
		difficulty: z.enum(BOSS_DIFFICULTY_ENUM),
		reset: z.enum(BOSS_RESET_ENUM),

		cleared: z.boolean().default(false),
		locked: z.boolean().default(false).optional(),
	})
	.superRefine((data, ctx): void => {
		if (!isValidBossDifficulty(data.name, data.difficulty)) {
			ctx.addIssue({ code: 'custom', message: 'Invalid difficulty.', path: ['difficulty'] });
		}
	})
	.strict();

export type getBossListBossResponseBody = z.infer<typeof getBossListBossesSchema>;

const getBossListCharactersSchema = z
	.object({
		characterId: characterIdRawSchema,
		name: characterNameRawSchema,
		class: z.enum(JOB_CLASSES),
		level: z.number().min(0).max(CHARACTER_MAX_LEVEL),

		bosses: z.array(getBossListBossesSchema),
	})
	.strict();

export type getBossListCharacterResponseBody = z.infer<typeof getBossListCharactersSchema>;

export const getBossListResponseSchema = z
	.object({
		id: IdRawSchema,
		weeklyBosses: z.number().min(0),
		totalGains: z.number().min(0),
		characters: z.array(getBossListCharactersSchema),
	})
	.strict();

export type getBossListResponseBody = z.infer<typeof getBossListResponseSchema>;

// Weekly boss Edit page

const getEditBossListBossesSchema = z
	.object({
		name: z.enum(BOSS_NAMES_ENUM),
		difficulty: z.enum(BOSS_DIFFICULTY_ENUM),
		reset: z.enum(BOSS_RESET_ENUM),

		dailyTotal: z.number().min(0).max(7),
	})
	.strict();

export type getEditBossListBossResponseBody = z.infer<typeof getEditBossListBossesSchema>;

const getEditBossListCharactersSchema = z
	.object({
		characterId: characterIdRawSchema,
		name: characterNameRawSchema,
		class: z.enum(JOB_CLASSES),
		level: z.number().min(0).max(CHARACTER_MAX_LEVEL),
		totalIncome: z.number().min(0),

		bosses: z.array(getEditBossListBossesSchema).default([]),
	})
	.strict();

export type getEditBossListCharacterResponseBody = z.infer<typeof getEditBossListCharactersSchema>;

export const getEditBossListResponseSchema = z
	.object({
		id: IdRawSchema,
		weeklyBosses: z.number().min(0),
		totalGains: z.number().min(0),
		characters: z.array(getEditBossListCharactersSchema).default([]),
	})
	.strict();

export type getEditBossListResponseBody = z.infer<typeof getEditBossListResponseSchema>;

// Toggle boss

export const toggleBossListResponseSchema = z
	.object({
		weeklyBossesUpdate: z.number(),
		totalGainUpdate: z.number(),
		bossType: z.string().nullable(),
		liberationPoints: z.number().nullable(),
	})
	.strict();

export type toggleBossListResponseBody = z.infer<typeof toggleBossListResponseSchema>;

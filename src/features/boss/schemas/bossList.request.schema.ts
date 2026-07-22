import { z } from 'zod';

import { BOSS_DIFFICULTY_ENUM, BOSS_RESET_ENUM, BOSS_NAMES_ENUM, getBossMaxPartySize } from '@data/bosses/bosses';
import { CHARACTER_MAX_LEVEL } from '@data/character/constants';
import { JOB_CLASSES } from '@data/classes/classes';
import {
	serverSchema,
	characterIdRawSchema,
	characterNameRawSchema,
} from '@features/character/schemas/character.schema';

import { IdRawSchema } from './bossList.response.schema';

export const getBossListRequestSchema = z
	.object({
		server: serverSchema,
	})
	.strict();

export type getBossListRequestBody = z.infer<typeof getBossListRequestSchema>;

export const getEditBossListRequestSchema = z
	.object({
		server: serverSchema,
	})
	.strict();

export type getEditBossListRequestBody = z.infer<typeof getEditBossListRequestSchema>;

// Update weekly boss

const updateBossListBossesSchema = z
	.object({
		name: z.enum(BOSS_NAMES_ENUM),
		difficulty: z.enum(BOSS_DIFFICULTY_ENUM),
		reset: z.enum(BOSS_RESET_ENUM),
		partySize: z.number().int().min(1),
		dailyTotal: z.number().min(0).max(7),
	})
	.strict()
	.superRefine((boss, context) => {
		const maxPartySize = getBossMaxPartySize(boss.name);

		if (boss.partySize > maxPartySize) {
			context.addIssue({
				code: 'custom',
				path: ['partySize'],
				message: `Party size cannot exceed ${maxPartySize} for ${boss.name}.`,
			});
		}
	});

const updateBossListCharactersSchema = z
	.object({
		characterId: characterIdRawSchema,
		name: characterNameRawSchema,
		class: z.enum(JOB_CLASSES),
		level: z.number().min(0).max(CHARACTER_MAX_LEVEL),
		totalIncome: z.number().min(0),

		bosses: z.array(updateBossListBossesSchema).default([]),
	})
	.strict();

export const updateBossListRequestSchema = z
	.object({
		id: IdRawSchema,
		weeklyBosses: z.number().min(0),
		characters: z.array(updateBossListCharactersSchema).default([]),
	})
	.strict();

export type updateBossListRequestBody = z.infer<typeof updateBossListRequestSchema>;

// Toggle boss

export const toggleBossListRequestSchema = z
	.object({
		bossListId: IdRawSchema,
		bossMonsterId: IdRawSchema,
	})
	.strict();

export type toggleBossListRequestBody = z.infer<typeof toggleBossListRequestSchema>;

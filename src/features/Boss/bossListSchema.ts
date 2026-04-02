import { z } from 'zod';

import { isValidBossDifficulty, bossDifficultySet } from '@data/bosses/bosses';
import { CHARACTER_MAX_LEVEL } from '@data/character/constants';
import { JOB_CLASSES } from '@data/classes/classes';
import { characterServerSideSchema } from '@features/character/character.server.schema';
import { serverSchema } from '@features/character/characterRequestSchema';
import { normalizeDayjsDate } from '@utils/dateFromDayjs';
import { sanitizeInputBackEnd } from '@utils/sanitizeInputBackEnd';

export const bossNames = Object.keys(bossDifficultySet) as readonly string[];
export const BossSchema = z
	.object({
		name: z.enum(bossNames),
		difficulty: z.string().transform(sanitizeInputBackEnd),
		reset: z.enum(['Daily', 'Weekly', 'Monthly']),

		cleared: z.boolean().default(false),

		dailyTotal: z.number().min(0).max(7).optional().default(0),
		date: z.preprocess(normalizeDayjsDate, z.date().nullable()).optional(),

		locked: z.boolean().optional().default(false),
	})
	.superRefine((data, ctx): void => {
		if (!isValidBossDifficulty(data.name, data.difficulty)) {
			ctx.addIssue({
				code: 'custom',
				message: 'Invalid difficulty.',
				path: ['difficulty'],
			});
		}
	});

const characterNameField = characterServerSideSchema;

export const BossCharacterSchema = z.object({
	name: characterNameField,
	class: z.enum(JOB_CLASSES),
	level: z.number().min(0).max(CHARACTER_MAX_LEVEL),
	totalIncome: z.number().default(0),
	bosses: z.array(BossSchema).default([]),
});

export const BossServerSchema = z.object({
	name: serverSchema,
	weeklyBosses: z.number().default(0),
	totalGains: z.number().default(0),
	characters: z.array(BossCharacterSchema).default([]),
});

export const BossListRequestSchema = z.object({
	server: serverSchema,
});

export const UpdateBossListRequestSchema = z.object({
	data: BossServerSchema,
});

export const ToggleBossRequestSchema = z
	.object({
		class: z.enum(JOB_CLASSES),
		bossName: z.enum(bossNames),
		difficulty: z.string().transform(sanitizeInputBackEnd),
		server: serverSchema,
	})
	.superRefine((data, ctx): void => {
		if (!isValidBossDifficulty(data.bossName, data.difficulty)) {
			ctx.addIssue({
				code: 'custom',
				message: 'Invalid difficulty.',
				path: ['difficulty'],
			});
		}
	});

export type ZodBossRequest = z.infer<typeof BossListRequestSchema>;
export type ZodBoss = z.infer<typeof BossSchema>;
export type ZodBossCharacter = z.infer<typeof BossCharacterSchema>;
export type ZodBossServer = z.infer<typeof BossServerSchema>;
export type UpdateBossListRequest = z.infer<typeof UpdateBossListRequestSchema>;
export type ToggleBossRequestSchema = z.infer<typeof ToggleBossRequestSchema>;

import { z } from 'zod';

import { bosses } from '@data/bosses/bosses';
import { CHARACTER_MAX_LEVEL } from '@data/character/constants';
import { JobClasses } from '@data/classes/classes';
import { characterServerSideSchema } from '@features/character/character.server.schema';
import { serverSchema } from '@features/character/characterRequestSchema';
import { normalizeDayjsDate } from '@utils/dateFromDayjs';
import { sanitizeInputBackEnd } from '@utils/sanitizeInputBackEnd';

// Build a map of valid difficulties for each boss.
const bossDifficultyMap = Object.fromEntries(
	bosses.map((b): [string, string[]] => [b.name, b.difficulties.map((d): string => d.name)]),
);

// Precompute boss names for enum validation
const bossNames = bosses.map((b) => b.name) as [string, ...string[]];

export const BossSchema = z
	.object({
		name: z.enum([...bossNames]),
		difficulty: z.string().transform(sanitizeInputBackEnd),
		reset: z.enum(['Daily', 'Weekly', 'Monthly']),

		cleared: z.boolean().default(false),

		dailyTotal: z.number().min(0).max(7).optional().default(0),
		date: z.preprocess(normalizeDayjsDate, z.date().nullable()).optional(),

		locked: z.boolean().optional().default(false),
	})
	.superRefine((data, ctx): void => {
		const validDifficulties = bossDifficultyMap[data.name];
		if (!validDifficulties.includes(data.difficulty)) {
			ctx.addIssue({
				code: 'custom',
				message: `Invalid difficulty.`,
				path: ['difficulty'],
			});
		}
	});

const characterNameField = characterServerSideSchema;
const classNames = JobClasses.map((c): string => c.className) as [string, ...string[]];
const codes = JobClasses.map((c): string => c.code) as [string, ...string[]];

export const BossCharacterSchema = z.object({
	name: characterNameField,
	code: z.enum(codes),
	class: z.enum(classNames),
	level: z.number().min(0).max(CHARACTER_MAX_LEVEL),
	totalIncome: z.number().optional().default(0),
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

export type ZodBossRequest = z.infer<typeof BossListRequestSchema>;
export type ZodBoss = z.infer<typeof BossSchema>;
export type ZodBossCharacter = z.infer<typeof BossCharacterSchema>;
export type ZodBossServer = z.infer<typeof BossServerSchema>;
export type UpdateBossListRequest = z.infer<typeof UpdateBossListRequestSchema>;

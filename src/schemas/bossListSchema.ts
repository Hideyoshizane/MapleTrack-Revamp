import { z } from 'zod';

import { bosses } from '@data/bosses/bosses';
import { CHARACTER_MAX_LEVEL } from '@data/character/constants';
import { JobClasses } from '@data/classes/classes';
import { servers } from '@data/servers/servers';
import { characterNameSchema } from '@schemas/characterNameSchema';
import { userSchema } from '@schemas/user';

// Build a map of valid difficulties for each boss.
const bossDifficultyMap = Object.fromEntries(
	bosses.map((b): [string, string[]] => [b.name, b.difficulties.map((d): string => d.name)])
);

// Precompute boss names for enum validation
const bossNames = bosses.map((b): string => b.name);

export const BossSchema = z
	.object({
		name: z.enum([...(bossNames as [string, ...string[]])]),
		difficulty: z.string(),
		reset: z.enum(['Daily', 'Weekly', 'Monthly']),
		checked: z.boolean().default(false),
		DailyTotal: z.number().min(0).max(7).optional().default(0),
		date: z
			.preprocess(
				(val): Date | null => (val === null ? null : val instanceof Date ? val : new Date(val as string)),
				z.date().nullable()
			)
			.optional(),
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

const characterNameField = characterNameSchema.shape.name;
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

// Extract allowed server names
const serverNames = servers.map((s): string => s.name) as [string, ...string[]];

export const BossServerSchema = z.object({
	server: z.enum(serverNames),
	weeklyBosses: z.number().default(0),
	totalGains: z.number().default(0),
	characters: z.array(BossCharacterSchema).default([]),
});

// Reuse schema for userOrigin
const usernameSchema = userSchema.shape.username;

export const BossListSchema = z.object({
	userOrigin: usernameSchema,
	lastUpdate: z
		.preprocess(
			(val): Date | null => (val === null ? null : val instanceof Date ? val : new Date(val as string)),
			z.date().nullable()
		)
		.optional(),
	server: z.array(BossServerSchema).default([]),
});

export const BossListRequestSchema = z.object({
	userOrigin: usernameSchema,

	server: z.enum(serverNames),
});

export type ZodBossRequest = z.infer<typeof BossListRequestSchema>;
export type ZodBoss = z.infer<typeof BossSchema>;
export type ZodBossCharacter = z.infer<typeof BossCharacterSchema>;
export type ZodBossServer = z.infer<typeof BossServerSchema>;
export type ZodBossList = z.infer<typeof BossListSchema>;

import { z } from 'zod';

import { DEFAULT_WEEKLY_TRIES, CHARACTER_MAX_LEVEL } from '@data/character/constants';
import { JobClasses } from '@data/classes/classes';
import { servers } from '@data/servers/servers';
import { SYMBOL_NAMES, CATEGORY_MAX_LEVEL } from '@data/symbols/symbolMappings';
import { characterNameSchema } from '@schemas/characterNameSchema';
import { userSchema } from '@schemas/user';
import { MIN_VALUE_BONUS_COOKIE, MAX_VALUE_BONUS_COOKIE } from '@utils/cookies/constants';

import { getCharacterDataRequestSchema } from './characterRequestSchema';

// Extract the `name` field schema from characterNameSchema
const characterNameField = characterNameSchema.shape.name;

// Extract allowed values from JobClasses
const classNames = JobClasses.map((c): string => c.className) as [string, ...string[]];
const codes = JobClasses.map((c): string => c.code) as [string, ...string[]];
const jobTypes = Array.from(new Set(JobClasses.map((c): string => c.jobType))) as [string, ...string[]];
const linkSkills = JobClasses.map((c): string => c.linkSkill) as [string, ...string[]];
const legions = JobClasses.map((c): string => c.legionType) as [string, ...string[]];

// Extract allowed server names
const serverNames = servers.map((s): string => s.name) as [string, ...string[]];

// Reuse schema for userOrigin
const usernameSchema = userSchema.shape.username;

const CONTENT_TYPES = [
	// Arcane
	'Daily Quest',
	'Erda Spectrum',
	'Reverse City',
	'Hungry Muto',
	'Yum Yum Island',
	'Midnight Chaser',
	'Spirit Savior',
	'Ranheim Defense',
	'Esfera Guardian',
] as const;

const ContentUpdateSchema = z.object({
	contentType: z.enum(CONTENT_TYPES),
	checked: z.boolean().optional(),
	tries: z.number().min(0).max(DEFAULT_WEEKLY_TRIES).optional(),
	date: z
		.preprocess(
			(val): Date | null => (val === null ? null : val instanceof Date ? val : new Date(val as string)),
			z.date().nullable()
		)
		.optional(),
});

const createSymbolSchema = <Name extends string, Category extends 'arcane' | 'sacred' | 'grand'>(
	names: readonly Name[],
	category: Category,
	maxLevel: number
): z.ZodObject<any> => {
	if (names.length === 0) throw new Error('Symbol names array cannot be empty');
	const tupleNames = names as [Name, ...Name[]];

	return z.object({
		name: z.enum(tupleNames),
		level: z.number().min(1).max(maxLevel),
		exp: z.number().min(0),
		category: z.literal(category),
		content: z.array(ContentUpdateSchema),
	});
};

// Arcane Symbols
const ArcaneSymbolUpdateSchema = createSymbolSchema(SYMBOL_NAMES.arcane, 'arcane', CATEGORY_MAX_LEVEL.arcane);

const SacredSymbolUpdateSchema = createSymbolSchema(SYMBOL_NAMES.sacred, 'sacred', CATEGORY_MAX_LEVEL.sacred);

const GrandSacredSymbolUpdateSchema = createSymbolSchema(SYMBOL_NAMES.grand, 'grand', CATEGORY_MAX_LEVEL.grand);

// Schema for character update request
const CharacterUpdateSchema = z
	.object({
		name: characterNameField,
		level: z.number().min(0).max(CHARACTER_MAX_LEVEL),
		targetLevel: z.number().min(0).max(CHARACTER_MAX_LEVEL),
		class: z.enum(classNames),
		code: z.enum(codes),
		jobType: z.enum(jobTypes),
		legion: z.enum(legions),
		linkSkill: z.enum(linkSkills),
		server: z.enum(serverNames),
		userOrigin: usernameSchema,
		bossing: z.boolean(),
		syncing: z.boolean(),
		ArcaneSymbol: z.array(ArcaneSymbolUpdateSchema),
		SacredSymbol: z.array(SacredSymbolUpdateSchema),
		GrandSacredSymbol: z.array(GrandSacredSymbolUpdateSchema),
	})
	.strict();

export type CharacterUpdateInput = z.infer<typeof CharacterUpdateSchema>;

export const getUpdateCharacterDataRequestSchema = getCharacterDataRequestSchema.extend({
	data: CharacterUpdateSchema,
});

export type UpdateCharacterRequestInput = z.infer<typeof getUpdateCharacterDataRequestSchema>;

const allSymbolNames = [...SYMBOL_NAMES.arcane, ...SYMBOL_NAMES.sacred, ...SYMBOL_NAMES.grand] as const;
export const updateCharacterDailySchema = z.object({
	symbolName: z.enum(allSymbolNames),
	bonus: z.number().min(MIN_VALUE_BONUS_COOKIE).max(MAX_VALUE_BONUS_COOKIE),
	userOrigin: usernameSchema,
	server: z.enum(serverNames),
	code: z.enum(codes),
});

// Type inferred from the schema for use across the codebase
export type UpdateCharacterDailyRequestInput = z.infer<typeof updateCharacterDailySchema>;

export const updateCharacterWeeklySchema = z.object({
	symbolName: z.enum(allSymbolNames),
	userOrigin: usernameSchema,
	server: z.enum(serverNames),
	code: z.enum(codes),
});

// Type inferred from the schema for use across the codebase
export type UpdateCharacterWeeklyRequestInput = z.infer<typeof updateCharacterWeeklySchema>;

export const updateAllDailySchema = z.object({
	userOrigin: usernameSchema,
	server: z.enum(serverNames),
	code: z.enum(codes),
	arcaneBonus: z.number().min(MIN_VALUE_BONUS_COOKIE).max(MAX_VALUE_BONUS_COOKIE),
	sacredBonus: z.number().min(MIN_VALUE_BONUS_COOKIE).max(MAX_VALUE_BONUS_COOKIE),
});

// Type inferred from the schema for use across the codebase
export type UpdateAllDailySchema = z.infer<typeof updateCharacterDailySchema>;

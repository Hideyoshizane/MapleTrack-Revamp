import { z } from 'zod';

import { MIN_VALUE_BONUS_COOKIE, MAX_VALUE_BONUS_COOKIE } from '@constants/cookiesConstants';
import { DEFAULT_WEEKLY_TRIES, CHARACTER_MAX_LEVEL } from '@data/character/constants';
import { JobClasses } from '@data/classes/classes';
import { SYMBOL_CONFIG } from '@data/symbols/symbolMappings';
import { serverSchema, getCharacterDataRequestSchema } from '@features/character/characterRequestSchema';
import { normalizeDayjsDate } from '@utils/dateFromDayjs';

import { characterNameRawSchema } from './character.raw.schema';

const classNames = JobClasses.map((c): string => c.className) as [string, ...string[]];
const codes = JobClasses.map((c): string => c.code) as [string, ...string[]];
const jobTypes = Array.from(new Set(JobClasses.map((c): string => c.jobType))) as [string, ...string[]];
const linkSkills = JobClasses.map((c): string => c.linkSkill) as [string, ...string[]];
const legions = JobClasses.map((c): string => c.legionType) as [string, ...string[]];

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
];

export const CharacterContentSchema = z.object({
	contentType: z.enum(CONTENT_TYPES),
	checked: z.boolean().optional(),
	cleared: z.boolean().optional(),
	tries: z.number().min(0).max(DEFAULT_WEEKLY_TRIES).nullable().optional(),
	date: z.preprocess(normalizeDayjsDate, z.date().nullable()).optional(),
});

const allSymbolNames = Object.values(SYMBOL_CONFIG).flatMap((config) => config.names) as [string, ...string[]];

const SymbolCategorySchema = z.enum(
	Object.keys(SYMBOL_CONFIG) as [keyof typeof SYMBOL_CONFIG, ...Array<keyof typeof SYMBOL_CONFIG>],
);

export const CharacterSymbolSchema = z.object({
	name: z.enum(allSymbolNames),
	level: z.number().min(1),
	exp: z.number().min(0),
	category: SymbolCategorySchema,
	content: z.array(CharacterContentSchema),
});

// Schema for character update request
const CharacterUpdateSchema = z
	.object({
		name: characterNameRawSchema,
		level: z.number().min(0).max(CHARACTER_MAX_LEVEL),
		targetLevel: z.number().min(0).max(CHARACTER_MAX_LEVEL),

		class: z.enum(classNames),
		code: z.enum(codes),
		jobType: z.enum(jobTypes),
		legion: z.enum(legions),
		linkSkill: z.enum(linkSkills),
		server: serverSchema,

		lastUpdate: z.preprocess(normalizeDayjsDate, z.date().nullable()).optional(),

		bossing: z.boolean(),
		syncing: z.boolean(),

		symbols: z.array(CharacterSymbolSchema),
	})
	.strict();

export type CharacterUpdateInput = z.infer<typeof CharacterUpdateSchema>;

export const getUpdateCharacterDataRequestSchema = getCharacterDataRequestSchema.extend({
	data: CharacterUpdateSchema,
});

export type UpdateCharacterRequestInput = z.infer<typeof getUpdateCharacterDataRequestSchema>;

export const updateCharacterDailySchema = z.object({
	symbolName: z.enum(allSymbolNames),
	bonus: z.number().min(MIN_VALUE_BONUS_COOKIE).max(MAX_VALUE_BONUS_COOKIE),
	server: serverSchema,
	code: z.enum(codes),
});

export type UpdateCharacterDailyRequestInput = z.infer<typeof updateCharacterDailySchema>;

export const updateCharacterWeeklySchema = z.object({
	symbolName: z.enum(allSymbolNames),
	server: serverSchema,
	code: z.enum(codes),
});

export type UpdateCharacterWeeklyRequestInput = z.infer<typeof updateCharacterWeeklySchema>;

export const updateAllDailySchema = z.object({
	server: serverSchema,
	code: z.enum(codes),
	arcaneBonus: z.number().min(MIN_VALUE_BONUS_COOKIE).max(MAX_VALUE_BONUS_COOKIE),
	sacredBonus: z.number().min(MIN_VALUE_BONUS_COOKIE).max(MAX_VALUE_BONUS_COOKIE),
});

export type UpdateAllDailySchema = z.infer<typeof updateAllDailySchema>;

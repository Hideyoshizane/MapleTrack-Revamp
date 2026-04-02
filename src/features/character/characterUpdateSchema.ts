import { z } from 'zod';

import { MIN_VALUE_BONUS_COOKIE, MAX_VALUE_BONUS_COOKIE } from '@constants/cookiesConstants';
import { DEFAULT_WEEKLY_TRIES, CHARACTER_MAX_LEVEL } from '@data/character/constants';
import { JOB_CLASSES, LINK_SKILL, JOB_TYPE, LEGION_TYPE } from '@data/classes/classes';
import { SYMBOL_CONFIG } from '@data/symbols/symbolMappings';
import { serverSchema, getCharacterDataRequestSchema } from '@features/character/characterRequestSchema';
import { normalizeDayjsDate } from '@utils/dateFromDayjs';

import { characterNameRawSchema } from './character.raw.schema';

const CONTENT_TYPES = [
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

const ALL_SYMBOL_NAMES = Object.values(SYMBOL_CONFIG).flatMap((cfg) => cfg.names);
const ALL_SYMBOL_CATEGORIES = Object.keys(SYMBOL_CONFIG) as Array<keyof typeof SYMBOL_CONFIG>;

export const CharacterSymbolSchema = z.object({
	name: z.enum(ALL_SYMBOL_NAMES as [string, ...string[]]),
	level: z.number().min(1),
	exp: z.number().min(0),
	category: z.enum(ALL_SYMBOL_CATEGORIES as [string, ...string[]]),
	content: z.array(CharacterContentSchema),
});

// Schema for character update request
const CharacterUpdateSchema = z
	.object({
		name: characterNameRawSchema,
		level: z.number().min(0).max(CHARACTER_MAX_LEVEL),
		targetLevel: z.number().min(0).max(CHARACTER_MAX_LEVEL),

		class: z.enum(JOB_CLASSES),
		jobType: z.enum(JOB_TYPE),
		legion: z.enum(LEGION_TYPE),
		linkSkill: z.enum(LINK_SKILL),
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
	symbolName: z.enum(ALL_SYMBOL_NAMES),
	bonus: z.number().min(MIN_VALUE_BONUS_COOKIE).max(MAX_VALUE_BONUS_COOKIE),
	server: serverSchema,
	class: z.enum(JOB_CLASSES),
});

export type UpdateCharacterDailyRequestInput = z.infer<typeof updateCharacterDailySchema>;

export const updateCharacterWeeklySchema = z.object({
	symbolName: z.enum(ALL_SYMBOL_NAMES),
	server: serverSchema,
	class: z.enum(JOB_CLASSES),
});

export type UpdateCharacterWeeklyRequestInput = z.infer<typeof updateCharacterWeeklySchema>;

export const updateAllDailySchema = z.object({
	server: serverSchema,
	class: z.enum(JOB_CLASSES),
	arcaneBonus: z.number().min(MIN_VALUE_BONUS_COOKIE).max(MAX_VALUE_BONUS_COOKIE),
	sacredBonus: z.number().min(MIN_VALUE_BONUS_COOKIE).max(MAX_VALUE_BONUS_COOKIE),
});

export type UpdateAllDailySchema = z.infer<typeof updateAllDailySchema>;

import { z } from 'zod';

import { CHARACTER_MAX_LEVEL, DEFAULT_WEEKLY_TRIES } from '@data/character/constants';
import { JOB_CLASSES, LINK_SKILL, JOB_TYPE, LEGION_TYPE } from '@data/classes/classes';

import {
	characterNameRawSchema,
	characterIdRawSchema,
	symbolIdRawSchema,
	serverSchema,
	CONTENT_TYPES,
	symbolNames,
	symbolCategoriesSchema,
	symbolNameSchema,
} from './character.schema';

// Home Page
const getAllCharactersSymbolsResponseSchema = z.object({
	name: symbolNameSchema,
	level: z.number().min(1),
	category: symbolCategoriesSchema,
});

export const getAllCharactersResponseSchema = z
	.object({
		name: characterNameRawSchema,
		level: z.number().min(0).max(CHARACTER_MAX_LEVEL),
		targetLevel: z.number().min(0).max(CHARACTER_MAX_LEVEL),
		bossing: z.boolean().default(false),

		class: z.enum(JOB_CLASSES),
		jobType: z.enum(JOB_TYPE),
		legion: z.enum(LEGION_TYPE),
		linkSkill: z.enum(LINK_SKILL),

		symbols: z.object({
			arcane: z.array(getAllCharactersSymbolsResponseSchema),
			sacred: z.array(getAllCharactersSymbolsResponseSchema),
		}),
	})
	.strict();

export type getAllCharactersResponseBody = z.infer<typeof getAllCharactersResponseSchema>;

//Character Page

const getCharacterContentSchema = z
	.object({
		contentType: z.enum(CONTENT_TYPES),
		checked: z.boolean().optional(),
		cleared: z.boolean().optional(),
		tries: z.number().min(0).max(DEFAULT_WEEKLY_TRIES).optional(),
	})
	.strict();

export const getCharacterDataSymbolsResponseSchema = z
	.object({
		id: symbolIdRawSchema,
		name: z.enum(symbolNames as unknown as [string, ...string[]]),
		level: z.number().min(1),
		exp: z.number().min(0),
		category: symbolCategoriesSchema,
		contents: z.array(getCharacterContentSchema),
	})
	.strict();

export type getCharacterDataSymbolsResponseBody = z.infer<typeof getCharacterDataSymbolsResponseSchema>;

export const getCharacterDataResponseSchema = z
	.object({
		id: characterIdRawSchema,
		name: characterNameRawSchema,
		level: z.number().min(0).max(CHARACTER_MAX_LEVEL),
		targetLevel: z.number().min(0).max(CHARACTER_MAX_LEVEL),
		bossing: z.boolean().default(false),
		syncing: z.boolean().default(false),

		class: z.enum(JOB_CLASSES),
		jobType: z.enum(JOB_TYPE),
		legion: z.enum(LEGION_TYPE),
		linkSkill: z.enum(LINK_SKILL),

		symbols: z.object({
			arcane: z.array(getCharacterDataSymbolsResponseSchema),
			sacred: z.array(getCharacterDataSymbolsResponseSchema),
			grand: z.array(getCharacterDataSymbolsResponseSchema),
		}),
	})
	.strict();

export type getCharacterDataResponseBody = z.infer<typeof getCharacterDataResponseSchema>;

//Edit Character Page

export const getEditCharacterContentSchema = z
	.object({
		contentType: z.enum(CONTENT_TYPES),
		checked: z.boolean().optional(),
		cleared: z.boolean().optional(),
		tries: z.number().min(0).max(DEFAULT_WEEKLY_TRIES).optional(),
	})
	.strict();

export type getEditCharacterContentResponseBody = z.infer<typeof getEditCharacterContentSchema>;

export const getEditCharacterDataSymbolsResponseSchema = z
	.object({
		id: symbolIdRawSchema,
		name: symbolNameSchema,
		level: z.number().min(1),
		exp: z.number().min(0),
		category: symbolCategoriesSchema,
		contents: z.array(getEditCharacterContentSchema),
	})
	.strict();

export type getEditCharacterDataSymbolsResponseBody = z.infer<typeof getEditCharacterDataSymbolsResponseSchema>;

export const getEditCharacterDataResponseSchema = z
	.object({
		id: characterIdRawSchema,
		name: characterNameRawSchema,
		level: z.number().min(0).max(CHARACTER_MAX_LEVEL),
		targetLevel: z.number().min(0).max(CHARACTER_MAX_LEVEL),
		bossing: z.boolean().default(false),
		syncing: z.boolean().default(false),

		class: z.enum(JOB_CLASSES),
		jobType: z.enum(JOB_TYPE),
		legion: z.enum(LEGION_TYPE),
		linkSkill: z.enum(LINK_SKILL),

		symbols: z.object({
			arcane: z.array(getEditCharacterDataSymbolsResponseSchema),
			sacred: z.array(getEditCharacterDataSymbolsResponseSchema),
			grand: z.array(getEditCharacterDataSymbolsResponseSchema),
		}),
	})
	.strict();

export type getEditCharacterDataResponseBody = z.infer<typeof getEditCharacterDataResponseSchema>;

//Character Data from API

export const getCharacterDataFromAPIResponseSchema = z
	.object({
		level: z.number().min(0),
		characterImgURL: z.url(),
	})
	.strict();

export type getCharacterDataFromAPIResponseBody = z.infer<typeof getCharacterDataFromAPIResponseSchema>;

//Update Character Daily

export const updateCharacterDailyResponseSchema = z
	.object({
		id: symbolIdRawSchema,
		currentExp: z.number().min(0),
		currentLevel: z.number().min(0),
	})
	.strict();

export type updateCharacterDailyResponseBody = z.infer<typeof updateCharacterDailyResponseSchema>;

//Update Character Weekly

export const updateCharacterWeeklyResponseSchema = z
	.object({
		id: symbolIdRawSchema,
		currentExp: z.number().min(0),
		currentLevel: z.number().min(0),
	})
	.strict();

export type updateCharacterWeeklyResponseBody = z.infer<typeof updateCharacterWeeklyResponseSchema>;

//Update All Daily

const levelUpResultSchema = z.object({
	currentLevel: z.number().min(0),
	currentExp: z.number().min(0),
});

export const updateCharacterAllDailyResponseSchema = z.record(z.string(), levelUpResultSchema).nullable();

export type updateCharacterAllDailyResponseBody = z.infer<typeof updateCharacterAllDailyResponseSchema>;

//Search Component

const searchCharacterDataResponseSchema = z.object({
	name: characterNameRawSchema,
	server: serverSchema,
	class: z.enum(JOB_CLASSES),
});

export const searchCharacterResponseSchema = z.object({
	characters: z.array(searchCharacterDataResponseSchema).max(6),
});

export type searchCharacterResponseBody = z.infer<typeof searchCharacterResponseSchema>;

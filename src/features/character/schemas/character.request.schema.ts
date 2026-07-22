import { z } from 'zod';

import { MIN_VALUE_BONUS_COOKIE, MAX_VALUE_BONUS_COOKIE } from '@constants/cookiesConstants';
import { CHARACTER_MAX_LEVEL } from '@data/character/constants';
import { JOB_CLASSES, LINK_SKILL, JOB_TYPE, LEGION_TYPE } from '@data/classes/classes';
import { ASTRA_DAILY_AREAS } from '@data/liberation/astraDaily';

import { getCharacterDataSymbolsResponseSchema } from './character.response.schema';
import {
	characterNameRawSchema,
	characterIdRawSchema,
	symbolIdRawSchema,
	serverSchema,
	jobClassSchema,
} from './character.schema';

// Home Page
export const getAllCharactersRequestSchema = z
	.object({
		server: serverSchema,
	})
	.strict();

export type GetAllCharactersRequestBody = z.infer<typeof getAllCharactersRequestSchema>;

// Character Page & Edit Character Page
export const getCharacterDataRequestSchema = z
	.object({
		server: serverSchema,
		className: jobClassSchema,
	})
	.strict();

export type getCharacterDataRequestBody = z.infer<typeof getCharacterDataRequestSchema>;

// character Data from API
export const getCharacterDataFromAPIRequestSchema = z
	.object({
		characterName: characterNameRawSchema,
		server: serverSchema,
	})
	.strict();

export type getCharacterDataFromAPIRequestBody = z.infer<typeof getCharacterDataFromAPIRequestSchema>;

// Update character
export const updateCharacterRequestSchema = z
	.object({
		id: characterIdRawSchema,
		name: characterNameRawSchema,
		server: serverSchema,
		level: z.number().min(0).max(CHARACTER_MAX_LEVEL),
		targetLevel: z.number().min(0).max(CHARACTER_MAX_LEVEL),
		bossing: z.boolean().default(false),
		syncing: z.boolean().default(false),

		class: z.enum(JOB_CLASSES),
		jobType: z.enum(JOB_TYPE),
		legion: z.enum(LEGION_TYPE),
		linkSkill: z.enum(LINK_SKILL),

		lastSymbolDaily: z.enum(ASTRA_DAILY_AREAS).nullable(),

		symbols: z.object({
			arcane: z.array(getCharacterDataSymbolsResponseSchema),
			sacred: z.array(getCharacterDataSymbolsResponseSchema),
			grand: z.array(getCharacterDataSymbolsResponseSchema),
		}),
	})
	.strict();

export type updateCharacterRequestBody = z.infer<typeof updateCharacterRequestSchema>;

// Update Daily

export const updateCharacterDailyRequestSchema = z
	.object({
		server: serverSchema,
		className: z.enum(JOB_CLASSES),
		id: symbolIdRawSchema,
		bonus: z.number().min(MIN_VALUE_BONUS_COOKIE).max(MAX_VALUE_BONUS_COOKIE),
	})
	.strict();

export type updateCharacterDailyRequestBody = z.infer<typeof updateCharacterDailyRequestSchema>;

// Update weekly

export const updateCharacterWeeklyRequestSchema = z
	.object({
		server: serverSchema,
		className: z.enum(JOB_CLASSES),
		id: symbolIdRawSchema,
	})
	.strict();

export type updateCharacterWeeklyRequestBody = z.infer<typeof updateCharacterWeeklyRequestSchema>;

// Update All Daily

export const updateCharacterAllDailyRequestSchema = z
	.object({
		server: serverSchema,
		className: z.enum(JOB_CLASSES),
		id: symbolIdRawSchema,
		arcaneBonus: z.number().min(MIN_VALUE_BONUS_COOKIE).max(MAX_VALUE_BONUS_COOKIE),
		sacredBonus: z.number().min(MIN_VALUE_BONUS_COOKIE).max(MAX_VALUE_BONUS_COOKIE),
	})
	.strict();

export type updateCharacterAllDailyRequestBody = z.infer<typeof updateCharacterAllDailyRequestSchema>;

export const searchCharacterRequestSchema = z
	.object({
		parameters: z
			.string()
			.trim()
			.min(3, 'Search must have at least 3 characters')
			.max(25, 'Search too long')
			.regex(/^[a-zA-Z0-9\s-]+$/, 'Invalid characters in search'),
	})
	.strict();

export type searchCharacterRequestBody = z.infer<typeof searchCharacterRequestSchema>;

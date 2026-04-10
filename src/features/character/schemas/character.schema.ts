import { SymbolCategory } from '@prisma/client';
import { z } from 'zod';

import { JOB_CLASSES } from '@data/classes/classes';
import { SERVER_NAMES } from '@data/servers/servers';
import { SYMBOL_CONFIG } from '@data/symbols/symbolMappings';

export const CONTENT_TYPES = [
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

// Server validation
export const serverSchema = z.enum(SERVER_NAMES, { message: 'Invalid server selected' });

// Character job validation
export const jobClassSchema = z.enum(JOB_CLASSES, { message: 'Invalid job class selected' });

export const symbolNames = Object.values(SYMBOL_CONFIG).flatMap((cfg) => cfg.names) as readonly string[];

export const characterNameRawSchema = z
	.string()
	.trim()
	.min(4, 'Name must be at least 4 characters.')
	.max(12, 'Name must be at most 12 characters.')
	.regex(/^[a-zA-Z0-9_-]+$/, 'Name can only contain letters, numbers, underscores, or dashes.')
	.refine((value): boolean => value !== 'Character Name', { message: 'This name is not allowed.' });

export const symbolIdRawSchema = z
	.string()
	.regex(/^[a-fA-F0-9]{24}$/, 'Invalid MongoDB ObjectId')
	.or(z.literal(''));

export const characterIdRawSchema = z
	.string()
	.regex(/^[a-fA-F0-9]{24}$/, 'Invalid MongoDB ObjectId')
	.or(z.literal(''));

export const symbolNameSchema = z.enum(Object.values(symbolNames) as [string, ...string[]]);

export const symbolCategoriesSchema = z.enum(Object.values(SymbolCategory) as [string, ...string[]]);

import { SymbolCategory } from '@prisma/client';
import { z } from 'zod';

import { JOB_CLASSES } from '@data/classes/classes';
import { SERVER_NAMES } from '@data/servers/servers';
import { SYMBOL_MAP } from '@data/symbols/symbolMappings';

// Server validation
export const serverSchema = z.enum(SERVER_NAMES, { message: 'Invalid server selected' });

// Character job validation
export const jobClassSchema = z.enum(JOB_CLASSES, { message: 'Invalid job class selected' });

export const symbolNames = Object.keys(SYMBOL_MAP) as [string, ...string[]];

const contentTypeSet = new Set<string>();

for (const symbol of Object.values(SYMBOL_MAP)) {
	for (const content of symbol.contents) {
		contentTypeSet.add(content.name);
	}
}

contentTypeSet.add('Weekly');

export const CONTENT_TYPES = Array.from(contentTypeSet) as [string, ...string[]];

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

export const symbolCategoriesSchema = z.enum(Object.values(SymbolCategory) as [SymbolCategory, ...SymbolCategory[]]);

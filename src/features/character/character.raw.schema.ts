import { z } from 'zod';

export const characterNameRawSchema = z
	.string()
	.trim()
	.min(4, 'Name must be at least 4 characters.')
	.max(12, 'Name must be at most 12 characters.')
	.regex(/^[a-zA-Z0-9_-]+$/, 'Name can only contain letters, numbers, underscores, or dashes.')
	.refine((value): boolean => value !== 'Character Name', {
		message: 'This name is not allowed.',
	});

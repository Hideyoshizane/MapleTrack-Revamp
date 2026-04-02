import { z } from 'zod';

import { JOB_CLASSES } from '@data/classes/classes';
import { SERVER_NAMES } from '@data/servers/servers';

// Server validation
export const serverSchema = z.enum(SERVER_NAMES, {
	message: 'Invalid server selected',
});

// Character job validation
export const jobClassSchema = z.enum(JOB_CLASSES, {
	message: 'Invalid job class selected',
});
export const getAllCharactersRequestSchema = z.object({
	server: serverSchema,
});

export const getCharacterDataRequestSchema = z.object({
	server: serverSchema,
	className: jobClassSchema,
});

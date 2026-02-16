import { z } from 'zod';

import { JobClasses } from '@data/classes/classes';
import { servers } from '@data/servers/servers';

// Server validation
const serverNames = servers.map((s): string => s.name);
export const serverSchema = z.enum(serverNames, {
	message: 'Invalid server selected',
});

// Character job validation
const jobClassCodes = JobClasses.map((c): string => c.code);
const jobClassSchema = z.enum(jobClassCodes, {
	message: 'Invalid job class selected',
});

export const getAllCharactersRequestSchema = z.object({
	server: serverSchema,
});

export const getCharacterDataRequestSchema = z.object({
	server: serverSchema,
	code: jobClassSchema,
});

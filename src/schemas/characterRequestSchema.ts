import { z } from 'zod';

import { JobClasses } from '@data/classes/classes';
import { servers } from '@data/servers/servers';
import { userSchema } from '@schemas/user';

// Reuse only the username part of userSchema
const usernameSchema = userSchema.shape.username;

// Server validation
const serverNames = servers.map((s): string => s.name);
const serverSchema = z.enum(serverNames, {
	message: 'Invalid server selected',
});

// Character job validation
const jobClassCodes = JobClasses.map((c): string => c.code);
const jobClassSchema = z.enum(jobClassCodes, {
	message: 'Invalid job class selected',
});

export const getAllCharactersRequestSchema = z.object({
	username: usernameSchema,
	server: serverSchema,
});

export const getCharacterDataRequestSchema = z.object({
	userOrigin: usernameSchema,
	server: serverSchema,
	code: jobClassSchema,
});

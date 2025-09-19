import { z } from 'zod';
import { userSchema } from '@schemas/user';
import { servers } from '@data/servers/servers';
import { JobClasses } from '@data/classes/classes';

// Reuse only the username part of userSchema
const usernameSchema = userSchema.shape.username;

// Server validation
const serverNames = servers.map((s) => s.name) as string[];
export const serverSchema = z.enum(serverNames, {
	message: 'Invalid server selected',
});

// Character job validation
const jobClassCodes = JobClasses.map((c) => c.code) as string[];
export const jobClassSchema = z.enum(jobClassCodes, {
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

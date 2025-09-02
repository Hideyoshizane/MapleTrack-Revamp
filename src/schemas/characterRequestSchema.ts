import { z } from 'zod';

// ---------- Request validation schemas ----------

export const getAllCharactersRequestSchema = z.object({
	username: z.string().min(1, 'Username is required'),
	server: z.string().min(1, 'Server is required'),
});

export const getCharacterDataRequestSchema = z.object({
	userOrigin: z.string().min(1, 'User origin is required'),
	server: z.string().min(1, 'Server is required'),
	code: z.string().min(1, 'Character code is required'),
});

import { z } from 'zod';

export const userSchema = z.object({
	username: z.string().min(3).max(32),
	email: z.email().max(100),
	password: z.string().min(8).max(72),
});

export type SignupData = z.infer<typeof userSchema>;

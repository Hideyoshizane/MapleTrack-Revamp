import { z } from 'zod';

export const userSchema = z.object({
	username: z
		.string()
		.min(3, 'Username must be at least 3 characters.')
		.max(32, 'Username must be at most 32 characters.'),
	email: z.email('Invalid email format.').max(100, 'Email must be at most 100 characters.'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters.')
		.max(72, 'Password must be at most 72 characters.'),
});

export type SignupData = z.infer<typeof userSchema>;

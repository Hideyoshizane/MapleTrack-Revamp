import { z } from 'zod';
import reserved from 'reserved-usernames';

const CUSTOM_RESERVED = ['mapletrack', 'maple-track'];
const RESERVED_USERNAMES = new Set([...reserved, ...CUSTOM_RESERVED.map((u) => u.toLowerCase())]);

export const userSchema = z
	.object({
		username: z
			.string()
			.trim()
			.min(3, 'Username must be at least 3 characters.')
			.max(16, 'Username must be at most 16 characters.')
			.regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, or dashes.')
			.transform((val) =>
				val
					.normalize('NFD')
					.replace(/[\u0300-\u036f]/g, '')
					.replace(/[^a-zA-Z0-9_]/g, '')
			)
			.refine((val) => !RESERVED_USERNAMES.has(val), {
				message: 'This username is reserved and cannot be used.',
			}),

		email: z
			.email('Invalid email format.')
			.max(100, 'Email must be at most 100 characters.')
			.transform((val) => val.trim().toLowerCase()),

		password: z
			.string()
			.min(8, 'Password must be at least 8 characters.')
			.max(72, 'Password must be at most 72 characters.')
			.refine((val) => /[A-Z]/.test(val), { message: 'Password must contain at least one uppercase letter.' })
			.refine((val) => /[a-z]/.test(val), { message: 'Password must contain at least one lowercase letter.' })
			.refine((val) => /[0-9]/.test(val), { message: 'Password must contain at least one number.' })
			.refine((val) => /[^A-Za-z0-9]/.test(val), { message: 'Password must contain at least one special character.' }),

		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match.',
		path: ['confirmPassword'],
	});

export type SignupData = z.infer<typeof userSchema>;

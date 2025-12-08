import reserved from 'reserved-usernames';
import { z } from 'zod';

const CUSTOM_RESERVED = ['mapletrack', 'maple-track'];
const RESERVED_USERNAMES = new Set([...reserved, ...CUSTOM_RESERVED.map((u): string => u.toLowerCase())]);

export const userSchema = z
	.object({
		username: z
			.string()
			.trim()
			.nonempty({ message: 'Username is required.' })
			.min(3, 'Username must be at least 3 characters.')
			.max(16, 'Username must be at most 16 characters.')
			.regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, or dashes.')
			.transform((val): string =>
				val
					.normalize('NFD')
					.replace(/[\u0300-\u036f]/g, '')
					.replace(/[^a-zA-Z0-9_]/g, '')
			)
			.refine((val: string): boolean => !RESERVED_USERNAMES.has(val), {
				message: 'This username is reserved and cannot be used.',
			}),

		email: z
			.email('Invalid email format.')
			.nonempty({ message: 'E-mail is required.' })
			.max(100, 'Email must be at most 100 characters.')
			.transform((val): string => val.trim().toLowerCase()),

		password: z
			.string()
			.nonempty({ message: 'Password is required.' })
			.min(8, 'Password must be at least 8 characters.')
			.max(255, 'Password must be at most 255 characters.')
			.refine((val: string): boolean => /[A-Z]/.test(val), {
				message: 'Password must contain at least one uppercase letter.',
			})
			.refine((val: string): boolean => /[a-z]/.test(val), {
				message: 'Password must contain at least one lowercase letter.',
			})
			.refine((val: string): boolean => /[0-9]/.test(val), { message: 'Password must contain at least one number.' })
			.refine((val: string): boolean => /[^A-Za-z0-9]/.test(val), {
				message: 'Password must contain at least one special character.',
			}),

		confirmPassword: z.string().nonempty({ message: 'Confirm Password is required.' }),
	})
	.refine((data: { password: string; confirmPassword: string }): boolean => data.password === data.confirmPassword, {
		message: 'Passwords do not match.',
		path: ['confirmPassword'],
	});

export type SignupData = z.infer<typeof userSchema>;

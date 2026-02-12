import { z } from 'zod';

export const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

export const usernameRawSchema = z
	.string()
	.trim()
	.min(3, 'Username must be at least 3 characters.')
	.max(16, 'Username must be at most 16 characters.')
	.regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, or dashes.');

export const emailRawSchema = z
	.email('Invalid email format.')
	.max(100, 'Email must be at most 100 characters.')
	.transform((value) => value.toLowerCase());

export const passwordRawSchema = z
	.string()
	.min(8, 'Password must be at least 8 characters.')
	.max(72, 'Password must be at most 72 characters.')
	.regex(STRONG_PASSWORD_REGEX, 'Password must contain uppercase, lowercase, number, and special character.');

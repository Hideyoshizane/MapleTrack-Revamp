import { z } from 'zod';

import {
	STRONG_PASSWORD_REGEX,
	USERNAME_MIN_LENGTH,
	USERNAME_MAX_LENGTH,
	PASSWORD_MIN_LENGTH,
	PASSWORD_MAX_LENGTH,
	EMAIL_MAX_LENGTH,
} from './constants';

export const usernameRawSchema = z
	.string()
	.trim()
	.min(USERNAME_MIN_LENGTH, `Username must be at least ${USERNAME_MIN_LENGTH} characters.`)
	.max(USERNAME_MAX_LENGTH, `Username must be at most ${USERNAME_MAX_LENGTH} characters.`)
	.regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, or dashes.');

export const emailRawSchema = z
	.email('Invalid email format.')
	.max(EMAIL_MAX_LENGTH, `Email must be at most ${EMAIL_MAX_LENGTH} characters.`);

export const passwordRawSchema = z
	.string()
	.min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`)
	.max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`)
	.regex(STRONG_PASSWORD_REGEX, 'Password must contain uppercase, lowercase, number, and special character.');

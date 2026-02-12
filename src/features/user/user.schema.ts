import reserved from 'reserved-usernames';
import { z } from 'zod';

import { sanitizeInputBackEnd } from '@utils/sanitizeInputBackEnd';

import { canonicalizeUsername } from './canonicalUsername';
import { usernameRawSchema, emailRawSchema, passwordRawSchema } from './user.raw.schema';

const CUSTOM_RESERVED = ['mapletrack', 'maple-track'];
const RESERVED_USERNAMES = new Set([...reserved, ...CUSTOM_RESERVED].map((u) => u.toLowerCase()));

export const userSchema = z.object({
	username: usernameRawSchema.transform(canonicalizeUsername).refine((value) => !RESERVED_USERNAMES.has(value), {
		message: 'This username is reserved and cannot be used.',
	}),

	email: emailRawSchema.transform(sanitizeInputBackEnd),

	password: passwordRawSchema,
});

export type User = z.infer<typeof userSchema>;

import reserved from 'reserved-usernames';

import { sanitizeInput } from '@utils/sanitizeInput';

import { CUSTOM_RESERVED_USERNAMES } from './constants';

const RESERVED_SET = new Set([...reserved, ...CUSTOM_RESERVED_USERNAMES].map((u) => u.toLowerCase()));

export const canonicalizeUsername = (value: string): string => {
	const sanitized = sanitizeInput(value);

	return sanitized
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-zA-Z0-9_-]/g, '')
		.toLowerCase();
};

export const canonicalizeEmail = (value: string): string => sanitizeInput(value).toLowerCase();

export const isReservedUsername = (value: string): boolean => RESERVED_SET.has(value.toLowerCase());

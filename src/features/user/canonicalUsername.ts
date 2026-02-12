import { sanitizeInputBackEnd } from '@utils/sanitizeInputBackEnd';

export const canonicalizeUsername = (value: string): string => {
	const sanitized = sanitizeInputBackEnd(value);

	return sanitized
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-zA-Z0-9_-]/g, '')
		.toLowerCase();
};

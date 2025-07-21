import { userSchema } from '@schemas/user';
import reserved from 'reserved-usernames';

const CUSTOM_RESERVED = ['mapletrack', 'maple-track'];
const RESERVED_USERNAMES = new Set([...reserved, ...CUSTOM_RESERVED.map((u) => u.toLowerCase())]);

// Result of a validation check.
type ValidationResult = {
	isValid: boolean;
	error?: string;
};

// Extracts the first error message from a Zod safeParse result.
function extractErrorMessage<T>(result: ReturnType<typeof userSchema.shape.username.safeParse>): string {
	return result.success ? '' : result.error.issues[0]?.message || 'Invalid input.';
}

export function validateUsername(username: unknown): ValidationResult {
	if (typeof username !== 'string') {
		return { isValid: false, error: 'Username must be a string.' };
	}

	// Normalize username by trimming, removing accents/diacritics, filtering unsafe chars, and lowercasing.
	const cleaned = username
		.trim()
		.normalize('NFD') // Decompose accented characters
		.replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
		.replace(/[^a-zA-Z0-9_]/g, '') // Allow only alphanumeric and underscore
		.toLowerCase();

	// Check for reserved usernames.
	if (RESERVED_USERNAMES.has(cleaned)) {
		return { isValid: false, error: 'This username is reserved and cannot be used.' };
	}

	// Validate cleaned username against Zod schema
	const result = userSchema.shape.username.safeParse(cleaned);
	return result.success ? { isValid: true } : { isValid: false, error: extractErrorMessage(result) };
}

export function validateEmail(email: unknown): ValidationResult {
	if (typeof email !== 'string') {
		return { isValid: false, error: 'Email must be a string.' };
	}
	// Normalize by trimming and converting to lowercase
	const cleaned = email.trim().toLowerCase();

	// Validate cleaned email against Zod schema
	const result = userSchema.shape.email.safeParse(cleaned);
	return result.success ? { isValid: true } : { isValid: false, error: extractErrorMessage(result) };
}

export function validatePassword(password: unknown): ValidationResult {
	if (typeof password !== 'string') {
		return { isValid: false, error: 'Password must be a string.' };
	}

	const cleaned = password.trim();

	// Validate password length and base rules via schema
	const result = userSchema.shape.password.safeParse(cleaned);
	if (!result.success) {
		return { isValid: false, error: extractErrorMessage(result) };
	}

	const value = result.data;

	// Additional complexity rules to enforce password strength
	const rules = [
		{ regex: /[A-Z]/, error: 'Password must contain at least one uppercase letter.' },
		{ regex: /[a-z]/, error: 'Password must contain at least one lowercase letter.' },
		{ regex: /[0-9]/, error: 'Password must contain at least one number.' },
		{ regex: /[^A-Za-z0-9]/, error: 'Password must contain at least one special character.' },
	];

	// Check each rule, returning the first failed rule's error message
	for (const rule of rules) {
		if (!rule.regex.test(value)) {
			return { isValid: false, error: rule.error };
		}
	}

	return { isValid: true };
}

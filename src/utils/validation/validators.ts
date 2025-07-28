import { userSchema } from '@/schemas/user';
import reserved from 'reserved-usernames';
import { normalizeEmail, normalizeUsername } from './normalize';

const CUSTOM_RESERVED = ['mapletrack', 'maple-track'];
const RESERVED_USERNAMES = new Set([...reserved, ...CUSTOM_RESERVED.map((u) => u.toLowerCase())]);

type ValidationResult = {
	isValid: boolean;
	error?: string;
};

// Extract first error messages from Zod parse results
function extractErrorMessage(result: ReturnType<typeof userSchema.shape.username.safeParse>): string[] {
	if (result.success) return [];
	return result.error.issues.map((issue) => issue.message) || ['Invalid input.'];
}

export function validateUsername(username: unknown): ValidationResult {
	if (typeof username !== 'string') {
		return { isValid: false, error: 'Username must be a string.' };
	}
	// Normalize usernames by trimming, removing accents, filtering unwanted characters and lowercasing
	const cleaned = normalizeUsername(username);

	// Check for reserved usernames.
	if (RESERVED_USERNAMES.has(cleaned)) {
		return { isValid: false, error: 'This username is reserved and cannot be used.' };
	}

	// Validate cleaned username against Zod schema
	const result = userSchema.shape.username.safeParse(cleaned);
	return result.success ? { isValid: true } : { isValid: false, error: extractErrorMessage(result).join('\n') };
}

// Used for the login only
export function validateUsernameLogin(username: unknown): ValidationResult {
	if (typeof username !== 'string' || username.trim() === '') {
		return { isValid: false, error: 'Please enter your username.' };
	}
	// Optionally simple pattern check, e.g., only letters, numbers, underscores
	const simplePattern = /^[a-zA-Z0-9_]+$/;
	if (!simplePattern.test(username)) {
		return { isValid: false, error: 'Username contains invalid characters.' };
	}
	return { isValid: true };
}

export function validateEmail(email: unknown): ValidationResult {
	if (typeof email !== 'string') {
		return { isValid: false, error: 'Email must be a string.' };
	}
	// Normalize emails by trimming and lowercasing
	const cleaned = normalizeEmail(email);

	// Validate cleaned email against Zod schema
	const result = userSchema.shape.email.safeParse(cleaned);
	return result.success ? { isValid: true } : { isValid: false, error: extractErrorMessage(result).join('\n') };
}

const passwordRules = [
	{ regex: /[A-Z]/, error: 'Password must contain at least one uppercase letter.' },
	{ regex: /[a-z]/, error: 'Password must contain at least one lowercase letter.' },
	{ regex: /[0-9]/, error: 'Password must contain at least one number.' },
	{ regex: /[^A-Za-z0-9]/, error: 'Password must contain at least one special character.' },
];

export function validatePassword(password: unknown): ValidationResult {
	if (typeof password !== 'string') {
		return { isValid: false, error: 'Password must be a string.' };
	}

	const cleaned = password.trim();

	// Validate password length and base rules via schema
	const result = userSchema.shape.password.safeParse(cleaned);
	// Collect schema errors (array)
	const schemaErrors = result.success ? [] : extractErrorMessage(result);

	// Collect all failed rule messages
	const ruleErrors = passwordRules.filter((rule) => !rule.regex.test(cleaned)).map((rule) => rule.error);
	const allErrors = [...schemaErrors, ...ruleErrors];

	return allErrors.length > 0
		? { isValid: false, error: allErrors.map((e) => `- ${e}`).join('\n') }
		: { isValid: true };
}

// Used for the login only
export function validatePasswordLogin(password: unknown): ValidationResult {
	if (typeof password !== 'string' || password.trim() === '') {
		return { isValid: false, error: 'Please enter your password.' };
	}
	return { isValid: true };
}

export function validatePasswordConfirmation(password: unknown, confirmPassword: unknown): ValidationResult {
	if (typeof password !== 'string' || typeof confirmPassword !== 'string') {
		return { isValid: false, error: 'Passwords must be strings.' };
	}

	if (!password.trim() || !confirmPassword.trim()) {
		return { isValid: false, error: 'Password and confirmation cannot be empty.' };
	}

	if (password !== confirmPassword) {
		return { isValid: false, error: 'Passwords do not match.' };
	}

	return { isValid: true };
}

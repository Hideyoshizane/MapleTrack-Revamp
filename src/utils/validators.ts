import { userSchema } from '@features/user/userSchema';

import { validateField, type ValidationResult, extractErrorMessage } from './validateField';

export const validateUsername = (username: unknown): ValidationResult =>
	validateField(userSchema, 'username', username);

export const validateEmail = (email: unknown): ValidationResult => validateField(userSchema, 'email', email);

export const validatePassword = (password: unknown): ValidationResult =>
	validateField(userSchema, 'password', password);

// Validate password confirmation (handled at object level)
export const validatePasswordConfirmation = (password: unknown, confirmPassword: unknown): ValidationResult => {
	const schema = userSchema
		.pick({ password: true, confirmPassword: true })
		.refine((data: { password: string; confirmPassword: string }): boolean => data.password === data.confirmPassword, {
			message: 'Passwords do not match.',
			path: ['confirmPassword'],
		});

	// Ensure values are strings to avoid Zod default "expected string" errors
	const safeData = {
		password: typeof password === 'string' ? password : '',
		confirmPassword: typeof confirmPassword === 'string' ? confirmPassword : '',
	};

	const result = schema.safeParse(safeData);

	return result.success ? { isValid: true } : { isValid: false, error: extractErrorMessage(result) };
};

// Login-only helpers (looser rules than schema)
export const validateUsernameLogin = (username: unknown): ValidationResult => {
	if (typeof username !== 'string' || username.trim() === '') {
		return { isValid: false, error: 'Please enter your username.' };
	}
	// Trim and normalize username like in signup
	const normalized = username
		.trim()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-zA-Z0-9_-]/g, '');

	if (!/^[a-zA-Z0-9_-]+$/.test(normalized)) {
		return { isValid: false, error: 'Username contains invalid characters.' };
	}

	if (normalized.length < 3 || normalized.length > 16) {
		return { isValid: false, error: 'Username must be between 3 and 16 characters.' };
	}

	return { isValid: true };
};

export const validatePasswordLogin = (password: unknown): ValidationResult =>
	typeof password !== 'string' || password.trim() === ''
		? { isValid: false, error: 'Please enter your password.' }
		: { isValid: true };

import { z } from 'zod';

import { validateValue, type ValidationResult } from './validateField';

// Front End Validations
const usernameSchema = z
	.string()
	.trim()
	.min(3, 'Username must be at least 3 characters.')
	.max(16, 'Username must be at most 16 characters.')
	.regex(/^[a-zA-Z0-9_-]+$/, 'Username contains invalid characters.');

export const validateUsername = (username: unknown): ValidationResult => validateValue(usernameSchema, username);

const emailSchema = z.email('Invalid email format.').max(100, 'Email must be at most 100 characters.');

export const validateEmail = (email: unknown): ValidationResult => validateValue(emailSchema, email);

const FRONTEND_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;
const passwordSchema = z
	.string()
	.min(8, 'Password must be at least 8 characters.')
	.max(72, 'Password must be at most 72 characters.')
	.regex(FRONTEND_PASSWORD_REGEX, 'Password must contain uppercase, lowercase, number, and special character.');

export const validatePassword = (password: unknown): ValidationResult => validateValue(passwordSchema, password);

export const validatePasswordConfirmation = (password: unknown, confirmPassword: unknown): ValidationResult => {
	if (typeof password !== 'string' || typeof confirmPassword !== 'string') {
		return { isValid: false, error: 'Passwords must be valid strings.' };
	}

	if (password !== confirmPassword) {
		return { isValid: false, error: 'Passwords do not match.' };
	}

	return { isValid: true };
};

export const validateUsernameLogin = (username: unknown): ValidationResult =>
	typeof username !== 'string' || username.trim() === ''
		? { isValid: false, error: 'Please enter your username.' }
		: { isValid: true };

export const validatePasswordLogin = (password: unknown): ValidationResult =>
	typeof password !== 'string' || password.trim() === ''
		? { isValid: false, error: 'Please enter your password.' }
		: { isValid: true };

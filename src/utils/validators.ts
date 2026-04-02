import { usernameRawSchema, emailRawSchema, passwordRawSchema } from '@features/user/schemas/user.raw.schema';

import { validateValue, type ValidationResult } from './validateField';

// Front End Validations
export const validateUsername = (username: unknown): ValidationResult => validateValue(usernameRawSchema, username);

export const validateEmail = (email: unknown): ValidationResult => validateValue(emailRawSchema, email);

export const validatePassword = (password: unknown): ValidationResult => validateValue(passwordRawSchema, password);

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

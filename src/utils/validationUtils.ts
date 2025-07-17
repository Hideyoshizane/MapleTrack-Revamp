import { userSchema } from '@schemas/user';

type ValidationResult = { isValid: boolean; error?: string };

export function validateUsername(username: unknown): ValidationResult {
	const result = userSchema.shape.username.safeParse(username);

	if (result.success) return { isValid: true };
	return { isValid: false, error: result.error.issues[0].message };
}

export function validateEmail(email: unknown): ValidationResult {
	const result = userSchema.shape.email.safeParse(email);

	if (result.success) return { isValid: true };
	return { isValid: false, error: result.error.issues[0].message };
}

export function validatePassword(password: unknown): ValidationResult {
	const result = userSchema.shape.password.safeParse(password);

	if (!result.success) {
		return { isValid: false, error: result.error.issues[0].message };
	}

	const value = result.data;

	const rules = [
		{ regex: /[A-Z]/, error: 'Password must contain at least one uppercase letter.' },
		{ regex: /[a-z]/, error: 'Password must contain at least one lowercase letter.' },
		{ regex: /[0-9]/, error: 'Password must contain at least one number.' },
		{ regex: /[^A-Za-z0-9]/, error: 'Password must contain at least one special character.' },
	];

	for (const rule of rules) {
		if (!rule.regex.test(value)) {
			return { isValid: false, error: rule.error };
		}
	}

	return { isValid: true };
}

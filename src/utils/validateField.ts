import { toast } from 'react-toastify';

import type { z } from 'zod';

export type ValidationResult = {
	isValid: boolean;
	error?: string;
};

const extractErrorMessage = (
	result: { success: false; error: { issues: { message?: string }[] } } | { success: true },
): string => {
	if (result.success) {
		return '';
	}

	return result.error.issues.map((issue): string => `- ${issue.message ?? 'Invalid input.'}`).join('\n');
};

export const validateValue = <T>(schema: z.ZodType<T>, value: unknown): ValidationResult => {
	const result = schema.safeParse(value);

	return result.success ? { isValid: true } : { isValid: false, error: extractErrorMessage(result) };
};

export const handleFieldValidation = <T extends string>(
	field: T,
	validationResult: ValidationResult,
	setError: (field: T, error: { message: string }) => void,
): boolean => {
	if (!validationResult.isValid) {
		const message = validationResult.error ?? `Invalid ${field}`;
		setError(field, { message });
		toast.error(message);
		return true;
	}

	return false;
};

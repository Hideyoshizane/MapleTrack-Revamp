import { toast } from 'react-hot-toast';

import type { z, ZodObject, ZodType, ZodRawShape } from 'zod';

export type ValidationResult = { isValid: boolean; error?: string };

type SafeParseResult<I, O> = { success: true; data: O } | { success: false; error: z.ZodError<I> };

// Extract all error messages from Zod safeParse results
export const extractErrorMessage = <I, O>(result: SafeParseResult<I, O>): string =>
	result.success
		? ''
		: result.error.issues
				.map((issue: z.ZodError<I>['issues'][number]): string => issue.message ?? 'Invalid input.')
				.join('\n');

// Generic validator: runs safeParse on a field schema
export const validateField = <Schema extends ZodObject<ZodRawShape>, Field extends keyof z.infer<Schema>>(
	schema: Schema,
	field: Field,
	value: unknown
): ValidationResult => {
	const fieldSchema = schema.shape[field as keyof typeof schema.shape] as ZodType;
	const result = fieldSchema.safeParse(value);
	return result.success ? { isValid: true } : { isValid: false, error: extractErrorMessage(result) };
};

// Handle field-level validation
export const handleFieldValidation = <T extends string>(
	field: T,
	validationResult: ValidationResult,
	setError: (field: T, error: { message: string }) => void
): boolean => {
	if (!validationResult.isValid) {
		const errorMessage = validationResult.error ?? `Invalid ${field}`;
		setError(field, { message: errorMessage });
		toast.error(errorMessage);
		return true;
	}
	return false;
};

import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import type { ZodError } from 'zod';

export type Validator = (value: string) => string | undefined;

export const mapZodErrorsToForm = <T extends FieldValues>(error: ZodError<T>, setError: UseFormSetError<T>): void => {
	const fieldErrors = new Map<Path<T>, string[]>();

	for (const issue of error.issues) {
		const fieldName = issue.path[0] as Path<T> | undefined;
		if (!fieldName) {
			continue;
		}

		const existing = fieldErrors.get(fieldName) ?? [];
		existing.push(issue.message);
		fieldErrors.set(fieldName, existing);
	}

	for (const [field, messages] of fieldErrors.entries()) {
		setError(field, { type: 'manual', message: messages.map((msg) => `- ${msg}`).join('\n') });
	}
};

import { ZodError } from 'zod';

import type { Validator } from './validateField';
import type { ZodType } from 'zod';

export const zodValidator =
	(schema: ZodType<string>): Validator =>
	(value: string): string | undefined => {
		try {
			schema.parse(value);

			return undefined;
		} catch (error) {
			if (error instanceof ZodError) {
				return error.issues.map((i) => `- ${i.message}`).join('\n');
			}
			return '- Invalid input';
		}
	};

export const confirmPasswordValidator =
	(getPassword: () => string): Validator =>
	(value: string): string | undefined => {
		if (value !== getPassword()) {
			return '- Passwords do not match.';
		}
		return undefined;
	};

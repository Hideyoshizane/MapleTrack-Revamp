import { z } from 'zod';

import { sanitizeInputFrontend } from '@utils/sanitize/sanitizeInputFrontEnd';
import { validateField } from '@utils/validation/';

// Schema for validating character name
export const characterNameSchema = z.object({
	name: z
		.string()
		.trim()
		.min(4, 'Name must be at least 4 characters.')
		.max(12, 'Name must be at most 12 characters.')
		.regex(/^[a-zA-Z0-9_-]+$/, 'Name can only contain letters, numbers, underscores, or dashes.'),
});
// TypeScript type inferred from schema
export type CharacterNameSchema = z.infer<typeof characterNameSchema>;

// Type for validation result
type CharacterNameValidationResult = { success: true; value: string } | { success: false; error: string };

const validateCharacterName = (name: string): CharacterNameValidationResult => {
	// Sanitize first to remove malicious input
	const sanitizedName = sanitizeInputFrontend(name);

	const result = validateField(characterNameSchema, 'name', sanitizedName);

	if (!result.isValid) {
		return { success: false, error: result.error ?? 'Invalid name' } as const;
	}

	return { success: true, value: sanitizedName } as const;
};

export const checkCharacterName = (name: string): string | null => {
	if (name === 'Character Name') {
		return 'This name is not allowed.';
	}

	// Validate using schema
	const validation = validateCharacterName(name);

	// If invalid, return the error message
	return validation.success ? null : validation.error;
};

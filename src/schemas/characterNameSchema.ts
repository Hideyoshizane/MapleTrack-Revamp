import { z } from 'zod';

import { sanitizeInputFrontend } from '@/utils/sanitize';
// Schema for validating character name
export const characterNameSchema = z.object({
	name: z
		.string()
		.trim()
		.min(4, 'Name must be at least 4 characters.')
		.max(12, 'Name must be at most 12 characters.')
		.regex(/^[a-zA-Z0-9_-]+$/, 'Name can only contain letters, numbers, underscores, or dashes.'),
});

export type CharacterNameSchema = z.infer<typeof characterNameSchema>;

export type CharacterNameValidationResult = { success: true; value: string } | { success: false; error: string };

export function validateCharacterName(name: string): CharacterNameValidationResult {
	// Sanitize first to remove malicious input
	const sanitizedName = sanitizeInputFrontend(name);
	const result = characterNameSchema.safeParse({ name: sanitizedName });
	if (!result.success) {
		return { success: false, error: result.error.issues[0].message };
	}
	return { success: true, value: result.data.name };
}

export function checkCharacterName(name: string): string | null {
	if (name === 'Character Name') {
		return 'This name is not allowed.';
	}

	// Validate using schema
	const validation = validateCharacterName(name);

	// If invalid, return the error message
	if (!validation.success) return validation.error;

	return null;
}

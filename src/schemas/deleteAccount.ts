import { z } from 'zod';

// --- 1. Request body schema ---
export const deleteAccountRequestSchema = z.object({
	username: z.string(),
});

// TypeScript type inferred from schema
export type DeleteAccountRequestBody = z.infer<typeof deleteAccountRequestSchema>;

// --- 2. Success response schema ---
export const deleteAccountSuccessSchema = z.object({
	success: z.literal(true),
	message: z.string().optional(), // adapt to your BaseSuccessResponse fields
});

// TypeScript type inferred from schema
export type DeleteAccountSuccessResponse = z.infer<typeof deleteAccountSuccessSchema>;

// --- 3. Error response schema ---
export const deleteAccountErrorSchema = z.object({
	success: z.literal(false),
	error: z.string(),
	fieldErrors: z.record(z.string(), z.string()).optional(),
});

// TypeScript type inferred from schema
export type DeleteAccountErrorResponse = z.infer<typeof deleteAccountErrorSchema>;

// --- 4. Union type for API response ---
export const deleteAccountApiResponseSchema = z.union([deleteAccountSuccessSchema, deleteAccountErrorSchema]);

export type DeleteAccountApiResponse = z.infer<typeof deleteAccountApiResponseSchema>;

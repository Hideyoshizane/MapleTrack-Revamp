import { z } from 'zod';

import { usernameRawSchema, emailRawSchema, passwordRawSchema } from './user.raw.schema';
import { canonicalizeUsername, canonicalizeEmail, isReservedUsername } from './utils';

export const userSchema = z.object({
	username: usernameRawSchema.transform(canonicalizeUsername).refine((value) => !isReservedUsername(value), {
		message: 'This username is reserved and cannot be used.',
	}),

	email: emailRawSchema.transform(canonicalizeEmail),

	password: passwordRawSchema,
});

// Login
export const credentialsSchema = z.object({
	username: usernameRawSchema,
	password: passwordRawSchema,
});

export type Credentials = z.infer<typeof credentialsSchema>;

// Signup
export const signupRequestSchema = credentialsSchema
	.extend({
		email: emailRawSchema,
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ['confirmPassword'],
		message: 'Passwords do not match.',
	});

export type SignupRequestBody = z.infer<typeof signupRequestSchema>;

// Reset password
export const resetPasswordRequestSchema = z.object({
	token: z
		.string()
		.length(64, 'Invalid token length.')
		.regex(/^[a-f0-9]{64}$/, 'Invalid token format.'),
	password: passwordRawSchema,
});

export type ResetPasswordRequestBody = z.infer<typeof resetPasswordRequestSchema>;

// Forgot password
export const forgotPasswordRequestSchema = z.object({ email: emailRawSchema });

export type ForgotPasswordRequestBody = z.infer<typeof forgotPasswordRequestSchema>;

// Change password
export const changePasswordRequestSchema = z
	.object({
		currentPassword: z.string(),
		newPassword: passwordRawSchema,
	})
	.refine((data) => data.currentPassword !== data.newPassword, {
		path: ['newPassword'],
		message: 'New password must be different from current password.',
	});

export type ChangePasswordRequestBody = z.infer<typeof changePasswordRequestSchema>;

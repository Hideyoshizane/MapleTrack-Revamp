import { z } from 'zod';

import { usernameRawSchema, emailRawSchema, passwordRawSchema } from '@features/user/user.raw.schema';

const credentialsSchema = z.object({
	username: usernameRawSchema,
	password: passwordRawSchema,
});

export type Credentials = z.infer<typeof credentialsSchema>;

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

export const resetPasswordRequestSchema = z.object({
	token: z
		.string()
		.length(64, 'Invalid token length.')
		.regex(/^[a-f0-9]{64}$/, 'Invalid token format.'),
	password: passwordRawSchema,
});

export type ResetPasswordRequestBody = z.infer<typeof resetPasswordRequestSchema>;

export const forgotPasswordRequestSchema = z.object({
	email: emailRawSchema,
});

export type ForgotPasswordRequestBody = z.infer<typeof forgotPasswordRequestSchema>;

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

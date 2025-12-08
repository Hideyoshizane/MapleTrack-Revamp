import { z } from 'zod';

import { userSchema } from '@features/user/userSchema';

// Reuse userSchema
const usernameSchema = userSchema.shape.username;
const emailSchema = userSchema.shape.email;
const passwordSchema = userSchema.shape.password;

// Shared
const credentialsSchema = z.object({
	username: usernameSchema,
	password: passwordSchema,
});
export type Credentials = z.infer<typeof credentialsSchema>;

// Signup
export const signupRequestSchema = credentialsSchema
	.extend({
		email: emailSchema,
		confirmPassword: passwordSchema,
	})
	.refine((data: { password: string; confirmPassword: string }): boolean => data.password === data.confirmPassword, {
		path: ['confirmPassword'],
		message: 'Passwords do not match.',
	});
export type SignupRequestBody = z.infer<typeof signupRequestSchema>;

// Reset Password
export const resetPasswordRequestSchema = z.object({
	token: z
		.string()
		.length(64, 'Invalid token length.')
		.regex(/^[a-f0-9]{64}$/, 'Invalid token format.'),
	password: passwordSchema,
});
export type ResetPasswordRequestBody = z.infer<typeof resetPasswordRequestSchema>;

// Forgot Password
export const forgotPasswordRequestSchema = z.object({
	email: emailSchema,
});
export type ForgotPasswordRequestBody = z.infer<typeof forgotPasswordRequestSchema>;

// Change Password
export const changePasswordRequestSchema = z
	.object({
		username: usernameSchema,
		currentPassword: passwordSchema,
		newPassword: passwordSchema,
	})
	.refine(
		(data: { currentPassword: string; newPassword: string }): boolean => data.currentPassword !== data.newPassword,
		{
			path: ['newPassword'],
			message: 'New password must be different from current password.',
		}
	);
export type ChangePasswordRequestBody = z.infer<typeof changePasswordRequestSchema>;

// Delete Account
export const deleteAccountRequestSchema = z.object({
	username: usernameSchema,
});
export type DeleteAccountRequestBody = z.infer<typeof deleteAccountRequestSchema>;

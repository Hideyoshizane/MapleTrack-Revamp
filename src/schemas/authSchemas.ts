import { z } from 'zod';

// Shared
export const credentialsSchema = z.object({
	username: z.string(),
	password: z.string(),
});
export type Credentials = z.infer<typeof credentialsSchema>;

// Signup
export const signupRequestSchema = credentialsSchema.extend({
	email: z.email(),
});
export type SignupRequestBody = z.infer<typeof signupRequestSchema>;

// Reset Password
export const resetPasswordRequestSchema = z.object({
	token: z.string(),
	password: z.string(),
});
export type ResetPasswordRequestBody = z.infer<typeof resetPasswordRequestSchema>;

// Forgot Password
export const forgotPasswordRequestSchema = z.object({
	email: z.email(),
});
export type ForgotPasswordRequestBody = z.infer<typeof forgotPasswordRequestSchema>;

// Change Password
export const changePasswordRequestSchema = z.object({
	username: z.string(),
	currentPassword: z.string(),
	newPassword: z.string(),
});
export type ChangePasswordRequestBody = z.infer<typeof changePasswordRequestSchema>;

// Delete Account
export const deleteAccountRequestSchema = z.object({
	username: z.string(),
});
export type DeleteAccountRequestBody = z.infer<typeof deleteAccountRequestSchema>;

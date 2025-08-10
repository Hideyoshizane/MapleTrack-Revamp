import type {
	Credentials,
	SignupRequestBody,
	ResetPasswordRequestBody,
	ForgotPasswordRequestBody,
	ChangePasswordRequestBody,
	DeleteAccountRequestBody,
} from '@sharedTypes/api/auth';

// Login just reuses credentials
export type LoginFormData = Credentials;

// Signup form: backend props + confirmPassword (frontend-only)
export type SignupFormData = SignupRequestBody & {
	confirmPassword: string;
};

// Forgot password form: identical to backend
export type ForgotPasswordFormData = ForgotPasswordRequestBody;

// Reset password form: backend props + confirmPassword (frontend-only)
export type ResetPasswordFormData = ResetPasswordRequestBody & {
	confirmPassword: string;
};

// Change password frontend form data extends backend + confirmPassword
export type ChangePasswordFormData = ChangePasswordRequestBody & {
	confirmPassword: string;
};

// Delete Account frontend form data extends backend
export type deleteAccountData = DeleteAccountRequestBody;

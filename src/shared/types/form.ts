import type {
	Credentials,
	SignupRequestBody,
	ResetPasswordRequestBody,
	ForgotPasswordRequestBody,
	ChangePasswordRequestBody,
} from '@/schemas/auth.schemas';

// Login
export type LoginFormData = Credentials;

// Signup
export type SignupFormData = SignupRequestBody & {
	confirmPassword: string;
};

// Forgot Password
export type ForgotPasswordFormData = ForgotPasswordRequestBody;

//  Reset Password
export type ResetPasswordFormData = ResetPasswordRequestBody & {
	confirmPassword: string;
};

// Change Password
export type ChangePasswordFormData = ChangePasswordRequestBody & {
	confirmPassword: string;
};

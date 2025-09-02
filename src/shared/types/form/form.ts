import type {
	Credentials,
	SignupRequestBody,
	ResetPasswordRequestBody,
	ForgotPasswordRequestBody,
	ChangePasswordRequestBody,
	DeleteAccountRequestBody,
} from '@schemas/authSchemas';

// --- Login ---
export type LoginFormData = Credentials;

// --- Signup (adds confirmPassword) ---
export type SignupFormData = SignupRequestBody & {
	confirmPassword: string;
};

// --- Forgot Password ---
export type ForgotPasswordFormData = ForgotPasswordRequestBody;

// --- Reset Password (adds confirmPassword) ---
export type ResetPasswordFormData = ResetPasswordRequestBody & {
	confirmPassword: string;
};

// --- Change Password (adds confirmPassword) ---
export type ChangePasswordFormData = ChangePasswordRequestBody & {
	confirmPassword: string;
};

// --- Delete Account ---
export type DeleteAccountData = DeleteAccountRequestBody;

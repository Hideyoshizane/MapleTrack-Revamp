import type {
	Credentials,
	SignupRequestBody,
	ResetPasswordRequestBody,
	ForgotPasswordRequestBody,
	ChangePasswordRequestBody,
} from '@/features/user/schemas/user.schema';

export type LoginFormData = Credentials;

export type SignupFormData = SignupRequestBody;

export type ForgotPasswordFormData = ForgotPasswordRequestBody;

export type ResetPasswordFormData = ResetPasswordRequestBody & { confirmPassword: string };

export type ChangePasswordFormData = ChangePasswordRequestBody & { confirmPassword: string };

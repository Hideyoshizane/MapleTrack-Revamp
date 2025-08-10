import type { SignupFormData, ForgotPasswordFormData } from '@sharedTypes/form';

// Shared field error type for per-field validation feedback
type FieldErrorDetails<T> = Partial<Record<keyof T, string>>;

// Base structure for success responses
interface BaseSuccessResponse {
	success: true;
	message: string;
}

// Base structure for error responses with optional field errors
interface BaseErrorResponse<T> {
	success: false;
	error: string;
	details?: FieldErrorDetails<T>;
}

// Signup success response with user ID, excluding confirmPassword
export type SignupSuccessResponse = BaseSuccessResponse & {
	data?: Omit<SignupFormData, 'confirmPassword'> & { id: string };
};

// Signup error response with optional field-level errors
export type SignupErrorResponse = BaseErrorResponse<SignupFormData>;

// Union type for Signup API response
export type SignupApiResponse = SignupSuccessResponse | SignupErrorResponse;

// Forgot password success response (no payload)
export type ForgotPasswordSuccessResponse = BaseSuccessResponse;

// Forgot password error with potential email validation error
export type ForgotPasswordErrorResponse = BaseErrorResponse<ForgotPasswordFormData>;

// Union type for Forgot Password API response
export type ForgotPasswordApiResponse = ForgotPasswordSuccessResponse | ForgotPasswordErrorResponse;

// Core reusable credentials
export interface Credentials {
	username: string;
	password: string;
}

// Signup expects all three fields
export interface SignupRequestBody extends Credentials {
	email: string;
}

// Reset password from link
export interface ResetPasswordRequestBody {
	token: string;
	password: string;
}

// Forgot password
export interface ForgotPasswordRequestBody {
	email: string;
}

export interface ChangePasswordRequestBody {
	username: string;
	currentPassword: string;
	newPassword: string;
}

export type ChangePasswordFormData = ChangePasswordRequestBody & {
	confirmPassword: string;
};

// Success response type for change password
export type ChangePasswordSuccessResponse = BaseSuccessResponse;

// Error response type with optional field-level errors on ChangePasswordFormData
export type ChangePasswordErrorResponse = BaseErrorResponse<ChangePasswordFormData>;

// Union type for ChangePassword API response
export type ChangePasswordApiResponse = ChangePasswordSuccessResponse | ChangePasswordErrorResponse;

//Delete account
export interface DeleteAccountRequestBody {
	username: string;
}
// Success response type for delete account
export type DeleteAccountSuccessResponse = BaseSuccessResponse;

// Error response type with optional field-level errors on ChangePasswordFormData
export type DeleteAccountErrorResponse = BaseErrorResponse<ChangePasswordFormData>;

// Union type for ChangePassword API response
export type DeleteAccountApiResponse = DeleteAccountSuccessResponse | DeleteAccountErrorResponse;

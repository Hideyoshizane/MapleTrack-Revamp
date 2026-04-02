import { requestApi } from '@/lib/axios/apiClient';

import type {
	SignupRequestBody,
	ResetPasswordRequestBody,
	ForgotPasswordRequestBody,
	ChangePasswordRequestBody,
} from '@features/user/schemas/user.schema';
import type { ApiResponse } from '@sharedTypes/api';

export const userApi = {
	deleteAccount: (): Promise<ApiResponse> => requestApi('/account/delete', 'DELETE'),

	changePassword: (payload: ChangePasswordRequestBody): Promise<ApiResponse> =>
		requestApi('/auth/change-password', 'POST', payload),

	signup: (payload: SignupRequestBody): Promise<ApiResponse> => requestApi('/auth/signup', 'POST', payload),

	resetPassword: (payload: ResetPasswordRequestBody): Promise<ApiResponse> =>
		requestApi('/auth/reset-password', 'POST', payload),

	forgotPassword: (payload: ForgotPasswordRequestBody): Promise<ApiResponse> =>
		requestApi('/auth/forgot-password', 'POST', payload),
};

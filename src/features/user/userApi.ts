import axiosInstance from '@lib/axios/axios';

import type { ApiResponse } from '@sharedTypes/api';

type changePasswordPayload = {
	currentPassword: string;
	newPassword: string;
};

type SignupPayload = {
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
};

type ResetPasswordPayload = {
	password: string;
	token: string;
};

type ForgotPasswordPayload = {
	email: string;
};

export const userApi = {
	deleteAccount: async (): Promise<ApiResponse> => {
		const { data } = await axiosInstance.delete<ApiResponse>('/account/delete');

		return data;
	},

	changePassword: async (payload: changePasswordPayload): Promise<ApiResponse> => {
		const { data } = await axiosInstance.post<ApiResponse>('/auth/change-password', payload);

		return data;
	},

	signup: async (payload: SignupPayload): Promise<ApiResponse> => {
		const { data } = await axiosInstance.post<ApiResponse>('/auth/signup', payload);
		return data;
	},

	resetPassword: async (payload: ResetPasswordPayload): Promise<ApiResponse> => {
		const { data } = await axiosInstance.post<ApiResponse>('/auth/reset-password', payload);
		return data;
	},

	forgotPassword: async (payload: ForgotPasswordPayload): Promise<ApiResponse> => {
		const { data } = await axiosInstance.post<ApiResponse>('/auth/forgot-password', payload);
		return data;
	},
};

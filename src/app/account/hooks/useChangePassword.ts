import { signOut } from 'next-auth/react';
import { toast } from 'react-toastify';

import { changePasswordRequestSchema } from '@features/user/schemas/user.schema';
import { userApi } from '@features/user/userApi';

import type { ApiResponse } from '@sharedTypes/api';
import type { ChangePasswordFormData } from '@sharedTypes/form';
import type { AxiosError } from 'axios';

type UseChangePasswordReturn = {
	onSubmit: (data: ChangePasswordFormData) => Promise<void>;
};

export const useChangePassword = (): UseChangePasswordReturn => {
	const onSubmit = async (data: ChangePasswordFormData): Promise<void> => {
		try {
			const parsedResult = changePasswordRequestSchema.safeParse(data);

			const currentPassword = parsedResult.success ? parsedResult.data.currentPassword : data.currentPassword;
			const newPassword = parsedResult.success ? parsedResult.data.newPassword : data.newPassword;

			const payload = { currentPassword, newPassword };

			const result = await userApi.changePassword(payload);
			if (result.success) {
				toast.success('Password changed successfully.');
				await signOut({ callbackUrl: '/login' });

				return;
			}

			toast.error(result.message ?? 'Failed to change password');
		} catch (error: unknown) {
			const axiosError = error as AxiosError<ApiResponse>;
			const isTimeout = axiosError.code === 'ECONNABORTED';

			toast.error(isTimeout ? 'Request timed out. Please try again.' : 'Unexpected error occurred');

			if (!isTimeout) {
				console.error('Change password error:', axiosError);
			}
		}
	};

	return { onSubmit };
};

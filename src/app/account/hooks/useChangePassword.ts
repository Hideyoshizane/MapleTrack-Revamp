import { signOut } from 'next-auth/react';
import { toast } from 'react-toastify';

import { handleFieldValidation } from '@/utils/validateField';
import { userApi } from '@features/user/userApi';
import { sanitizeInputFrontend } from '@utils/sanitizeInputFrontEnd';
import { validatePassword, validatePasswordConfirmation } from '@utils/validators';

import type { ApiResponse } from '@sharedTypes/api';
import type { ChangePasswordFormData } from '@sharedTypes/form';
import type { ValidationResult } from '@utils/validateField';
import type { AxiosError } from 'axios';
import type { UseFormSetError } from 'react-hook-form';

type UseChangePasswordProps = {
	setError: UseFormSetError<ChangePasswordFormData>;
};

type UseChangePasswordReturn = {
	onSubmit: (data: ChangePasswordFormData) => Promise<void>;
};

export const useChangePassword = ({ setError }: UseChangePasswordProps): UseChangePasswordReturn => {
	const onSubmit = async (data: ChangePasswordFormData): Promise<void> => {
		try {
			const [currentPassword, newPassword, confirmPassword] = [
				data.currentPassword,
				data.newPassword,
				data.confirmPassword,
			].map(sanitizeInputFrontend);

			const validations = {
				currentPassword: validatePassword(currentPassword),
				newPassword: validatePassword(newPassword),
				confirmPassword: validatePasswordConfirmation(newPassword, confirmPassword),
			};

			const hasErrors = (Object.entries(validations) as [keyof ChangePasswordFormData, ValidationResult][]).some(
				([field, result]): boolean => handleFieldValidation(field, result, setError),
			);

			if (hasErrors) return;

			const payload = { currentPassword, newPassword };

			const result: ApiResponse = await userApi.changePassword(payload);

			if (result.success) {
				toast.success('Password changed successfully.');
				await signOut({ callbackUrl: '/login' });
				return;
			}

			toast.error(result.message || 'Failed to change password');

			setError('currentPassword', {
				message: result.message,
			});
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

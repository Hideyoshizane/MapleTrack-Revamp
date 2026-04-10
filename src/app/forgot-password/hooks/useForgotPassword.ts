('use client');

import { toast } from 'react-toastify';

import { userApi } from '@features/user/userApi';
import { sanitizeInputFrontend } from '@utils/sanitizeInputFrontEnd';
import { handleFieldValidation } from '@utils/validateField';
import { validateEmail } from '@utils/validators';

import type { ApiResponse } from '@sharedTypes/api';
import type { ForgotPasswordFormData } from '@sharedTypes/form';
import type { ValidationResult } from '@utils/validateField';
import type { UseFormSetError } from 'react-hook-form';

export const useForgotPassword = (
	setError: UseFormSetError<ForgotPasswordFormData>,
): { submitForgotPassword: (data: ForgotPasswordFormData) => Promise<void> } => {
	const submitForgotPassword = async (data: ForgotPasswordFormData): Promise<void> => {
		try {
			const email = sanitizeInputFrontend(data.email);

			const validations = { email: validateEmail(email) };

			const hasErrors = (Object.entries(validations) as [keyof ForgotPasswordFormData, ValidationResult][]).some(
				([field, result]): boolean => handleFieldValidation(field, result, setError),
			);

			if (hasErrors) {
				return;
			}

			const result: ApiResponse = await userApi.forgotPassword({ email });

			if (result.success) {
				toast.success(result.message ?? 'Success');
				return;
			}

			toast.error(result.message || 'Failed to process your request');

			if (result.message) {
				for (const [field, msg] of Object.entries(result.message)) {
					setError(field as keyof ForgotPasswordFormData, {
						message: msg ?? 'Invalid input',
					});
				}
			}
		} catch (err: unknown) {
			const isAbortError = (err as DOMException)?.name === 'AbortError';

			toast.error(isAbortError ? 'Request timed out.' : 'Unexpected error occurred');

			if (!isAbortError) {
				console.error('Forgot password error:', err);
			}
		}
	};

	return { submitForgotPassword };
};

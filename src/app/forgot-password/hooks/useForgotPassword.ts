'use client';

import { useCallback } from 'react';
import { toast } from 'react-toastify';

import { handleFieldValidation } from '@/utils/validateField';
import { userApi } from '@features/user/userApi';
import { sanitizeInputFrontend } from '@utils/sanitizeInputFrontEnd';
import { validateEmail } from '@utils/validators';

import type { ApiResponse } from '@sharedTypes/api';
import type { ForgotPasswordFormData } from '@sharedTypes/form';
import type { ValidationResult } from '@utils/validateField';
import type { UseFormSetError } from 'react-hook-form';

export const useForgotPassword = (
	setError: UseFormSetError<ForgotPasswordFormData>,
): { submitForgotPassword: (data: ForgotPasswordFormData) => Promise<void> } => {
	const submitForgotPassword = useCallback(
		async (data: ForgotPasswordFormData): Promise<void> => {
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

				if (!result.success) {
					toast.error(result.message || 'Failed to process your request');

					if (result.message) {
						Object.entries(result.message).forEach(([field, msg]): void => {
							setError(field as keyof ForgotPasswordFormData, { message: msg ?? 'Invalid input' });
						});
					}
				} else {
					toast.error('Unexpected response format');
				}
			} catch (err) {
				toast.error((err as DOMException)?.name === 'AbortError' ? 'Request timed out.' : 'Unexpected error occurred');
				console.error('Forgot password error:', err);
			}
		},
		[setError],
	);

	return { submitForgotPassword };
};

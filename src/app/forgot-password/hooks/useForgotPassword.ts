'use client';

import { useCallback } from 'react';
import { toast } from 'react-hot-toast';

import { fetchWithTimeout } from '@utils/fetch/withTimeout';
import { sanitizeInputFrontend } from '@utils/sanitize/sanitizeInputFrontEnd';
import { validateEmail, handleFieldValidation } from '@utils/validation';

import type { ApiResponse } from '@sharedTypes/api';
import type { ForgotPasswordFormData } from '@sharedTypes/form';
import type { ValidationResult } from '@utils/validation';
import type { UseFormSetError } from 'react-hook-form';

export const useForgotPassword = (
	setError: UseFormSetError<ForgotPasswordFormData>
): { submitForgotPassword: (data: ForgotPasswordFormData) => Promise<void> } => {
	const submitForgotPassword = useCallback(
		async (data: ForgotPasswordFormData): Promise<void> => {
			try {
				// Sanitize input
				const email = sanitizeInputFrontend(data.email);

				// Run validations
				const validations = { email: validateEmail(email) };
				const hasErrors = (Object.entries(validations) as [keyof ForgotPasswordFormData, ValidationResult][]).some(
					([field, result]): boolean => handleFieldValidation(field, result, setError)
				);
				if (hasErrors) return;

				// API request
				const response = await fetchWithTimeout('/api/auth/forgot-password', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email }),
				});

				const result = (await response.json()) as ApiResponse;

				if (response.ok && result.success) {
					toast.success(result.message ?? 'Success');
					return;
				}

				if (!result.success) {
					toast.error(result.error || 'Failed to process your request');

					if (result.details) {
						Object.entries(result.details).forEach(([field, msg]): void => {
							setError(field as keyof ForgotPasswordFormData, {
								message: msg ?? 'Invalid input',
							});
						});
					}
				} else {
					toast.error('Unexpected response format');
				}
			} catch (err) {
				if ((err as DOMException).name === 'AbortError') {
					toast.error('Request timed out. Please try again.');
				} else {
					toast.error('Unexpected error occurred');
					console.error('Forgot password error:', err);
				}
			}
		},
		[setError]
	);

	return { submitForgotPassword };
};

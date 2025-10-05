'use client';

import { useRouter } from 'next/navigation';
import { useForm, type Control, type UseFormHandleSubmit, type UseFormGetValues } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import { fetchWithTimeout } from '@utils/fetch/withTimeout';
import { sanitizeInputFrontend } from '@utils/sanitize/sanitizeInputFrontEnd';
import { validatePassword, validatePasswordConfirmation, handleFieldValidation } from '@utils/validation';

import type { ApiResponse } from '@sharedTypes/api';
import type { ResetPasswordFormData } from '@sharedTypes/form';
import type { ValidationResult } from '@utils/validation';

interface ResetPasswordPayload {
	password: string;
	token: string;
}

interface UseResetPasswordReturn {
	control: Control<ResetPasswordFormData>;
	handleSubmit: UseFormHandleSubmit<ResetPasswordFormData>;
	isSubmitting: boolean;
	isSubmitted: boolean;
	getValues: UseFormGetValues<ResetPasswordFormData>;
	onSubmit: (data: ResetPasswordFormData) => Promise<void>;
}

export const useResetPassword = (rawToken: string): UseResetPasswordReturn => {
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { isSubmitting, isSubmitted },
		setError,
		getValues,
	} = useForm<ResetPasswordFormData>({
		mode: 'onBlur',
		defaultValues: { password: '', confirmPassword: '' },
	});

	// sanitize once
	const token = sanitizeInputFrontend(rawToken);

	// helper to avoid repeated toast calls
	const showResetError = (msg?: string): string => toast.error(msg ?? 'Failed to reset the password');

	const onSubmit = async (data: ResetPasswordFormData): Promise<void> => {
		try {
			if (!token) {
				toast.error('Invalid or missing token.');
				return;
			}

			const sanitizedData = {
				password: sanitizeInputFrontend(data.password),
				confirmPassword: sanitizeInputFrontend(data.confirmPassword),
			};

			const validations = {
				password: validatePassword(sanitizedData.password),
				confirmPassword: validatePasswordConfirmation(sanitizedData.password, sanitizedData.confirmPassword),
			};

			// abort if validations fail
			const hasErrors = (Object.entries(validations) as [keyof ResetPasswordFormData, ValidationResult][]).some(
				([field, result]): boolean => handleFieldValidation(field, result, setError)
			);
			if (hasErrors) return;

			const payload: ResetPasswordPayload = {
				password: sanitizedData.password,
				token,
			};

			const response = await fetchWithTimeout('/api/auth/reset-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			const result = (await response.json()) as ApiResponse;

			if (response.ok && result.success) {
				router.push('/login?reset=1');
			} else if (!result.success) {
				showResetError(result.error);
				if (result.details) {
					for (const [field, msg] of Object.entries(result.details)) {
						setError(field as keyof ResetPasswordFormData, {
							message: msg ?? 'Invalid input',
						});
					}
				}
			} else {
				showResetError();
			}
		} catch (error: unknown) {
			if (error instanceof DOMException && error.name === 'AbortError') {
				toast.error('Request timed out. Please try again.');
			} else {
				showResetError('Unexpected error occurred');
				console.error('[ResetPasswordPage] Unexpected error:', error);
			}
		}
	};

	return { control, handleSubmit, isSubmitting, isSubmitted, getValues, onSubmit };
};

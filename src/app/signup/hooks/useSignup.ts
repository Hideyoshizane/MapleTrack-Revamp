'use client';

import { useRouter } from 'next/navigation';
import { useForm, type Control, type UseFormHandleSubmit, type UseFormGetValues } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import { fetchWithTimeout } from '@utils/fetch/withTimeout';
import { sanitizeInputFrontend } from '@utils/sanitize/sanitizeInputFrontEnd';
import {
	validateUsername,
	validateEmail,
	validatePassword,
	validatePasswordConfirmation,
	handleFieldValidation,
} from '@utils/validation';

import type { ApiResponse } from '@sharedTypes/api';
import type { SignupFormData } from '@sharedTypes/form';
import type { ValidationResult } from '@utils/validation';

interface SignupPayload {
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
}

interface UseSignupReturn {
	control: Control<SignupFormData>;
	handleSubmit: UseFormHandleSubmit<SignupFormData>;
	isSubmitting: boolean;
	isSubmitted: boolean;
	getValues: UseFormGetValues<SignupFormData>;
	onSubmit: (data: SignupFormData) => Promise<void>;
}

export const useSignup = (): UseSignupReturn => {
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { isSubmitting, isSubmitted },
		setError,
		getValues,
	} = useForm<SignupFormData>({
		mode: 'onBlur',
		defaultValues: {
			username: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	});

	const showError = (msg?: string): string => toast.error(msg ?? 'Failed to create user');

	const onSubmit = async (data: SignupFormData): Promise<void> => {
		try {
			// Sanitize inputs to avoid XSS
			const sanitizedData: SignupFormData = {
				username: sanitizeInputFrontend(data.username),
				email: sanitizeInputFrontend(data.email),
				password: sanitizeInputFrontend(data.password),
				confirmPassword: sanitizeInputFrontend(data.confirmPassword),
			};

			// Client-side validation results
			const validations = {
				username: validateUsername(sanitizedData.username),
				email: validateEmail(sanitizedData.email),
				password: validatePassword(sanitizedData.password),
				confirmPassword: validatePasswordConfirmation(sanitizedData.password, sanitizedData.confirmPassword),
			};

			// Apply errors from validation results to form, abort if any found
			const hasErrors = (Object.entries(validations) as [keyof SignupFormData, ValidationResult][]).some(
				([field, result]): boolean => handleFieldValidation(field, result, setError)
			);
			if (hasErrors) return;

			const payload: SignupPayload = sanitizedData;

			const response = await fetchWithTimeout('/api/auth/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			const result = (await response.json()) as ApiResponse;

			if (response.ok && result.success) {
				router.push('/login?success=1');
			} else {
				showError(result.error);
				if (result.details) {
					for (const [field, msg] of Object.entries(result.details)) {
						setError(field as keyof SignupFormData, { message: msg ?? 'Invalid input' });
					}
				}
			}
		} catch (error: unknown) {
			if (error instanceof DOMException && error.name === 'AbortError') {
				toast.error('Request timed out. Please try again.');
			} else {
				showError('Unexpected error occurred');
				console.error('[Signup] Unexpected error', error);
			}
		}
	};

	return { control, handleSubmit, isSubmitting, isSubmitted, getValues, onSubmit };
};

'use client';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useForm, type Control, type UseFormHandleSubmit, type UseFormGetValues } from 'react-hook-form';
import { toast } from 'react-toastify';

import { userApi } from '@features/user/userApi';
import { sanitizeInputFrontend } from '@utils/sanitizeInputFrontEnd';
import { handleFieldValidation } from '@utils/validateField';
import { validateUsername, validateEmail, validatePassword, validatePasswordConfirmation } from '@utils/validators';

import type { ApiResponse } from '@sharedTypes/api';
import type { SignupFormData } from '@sharedTypes/form';
import type { ValidationResult } from '@utils/validateField';

type UseSignupReturn = {
	control: Control<SignupFormData>;
	handleSubmit: UseFormHandleSubmit<SignupFormData>;
	isSubmitting: boolean;
	isSubmitted: boolean;
	isValid: boolean;
	getValues: UseFormGetValues<SignupFormData>;
	onSubmit: (data: SignupFormData) => Promise<void>;
};

export const useSignup = (): UseSignupReturn => {
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { isSubmitting, isSubmitted, isValid },
		setError,
		getValues,
	} = useForm<SignupFormData>({
		mode: 'onBlur',
		criteriaMode: 'firstError',
		defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
	});

	const onSubmit = async (data: SignupFormData): Promise<void> => {
		try {
			const sanitizedData: SignupFormData = {
				username: sanitizeInputFrontend(data.username),
				email: sanitizeInputFrontend(data.email),
				password: sanitizeInputFrontend(data.password),
				confirmPassword: sanitizeInputFrontend(data.confirmPassword),
			};

			const validations = {
				username: validateUsername(sanitizedData.username),
				email: validateEmail(sanitizedData.email),
				password: validatePassword(sanitizedData.password),
				confirmPassword: validatePasswordConfirmation(sanitizedData.password, sanitizedData.confirmPassword),
			};

			const hasErrors = (Object.entries(validations) as [keyof SignupFormData, ValidationResult][]).some(
				([field, result]): boolean => handleFieldValidation(field, result, setError)
			);

			if (hasErrors) {
				toast.error('Invalid input.');
				return;
			}

			const result: ApiResponse = await userApi.signup(sanitizedData);

			if (result.success) {
				router.push('/login?success=1');
			} else {
				toast.error(result.message);
				if (result.message) {
					for (const [field, msg] of Object.entries(result.message)) {
						setError(field as keyof SignupFormData, { message: msg ?? 'Invalid input' });
					}
				}
			}
		} catch (error: unknown) {
			if (axios.isAxiosError<ApiResponse>(error) && error.response) {
				const apiMessage = error.response.data?.message;

				toast.error(apiMessage ?? 'Signup failed');

				return;
			}

			if (error instanceof DOMException && error.name === 'AbortError') {
				toast.error('Request timed out. Please try again.');
				return;
			}

			console.error('[Signup] Unexpected error', error);
			toast.error('Unexpected error occurred');
		}
	};

	return {
		control,
		handleSubmit,
		isSubmitting,
		isSubmitted,
		isValid,
		getValues,
		onSubmit,
	};
};

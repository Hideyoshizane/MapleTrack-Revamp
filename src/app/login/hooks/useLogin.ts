'use client';

import { signIn } from 'next-auth/react';
import { toast } from 'react-toastify';

import { sanitizeInputFrontend } from '@utils/sanitizeInputFrontEnd';
import { handleFieldValidation } from '@utils/validateField';
import { validateUsernameLogin, validatePasswordLogin } from '@utils/validators';

import type { LoginFormData } from '@sharedTypes/form';
import type { ValidationResult } from '@utils/validateField';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { UseFormSetError } from 'react-hook-form';

export const useLogin = (
	setError: UseFormSetError<LoginFormData>,
	router: AppRouterInstance,
): { submitLogin: (data: LoginFormData) => Promise<void> } => {
	const submitLogin = async (data: LoginFormData): Promise<void> => {
		try {
			const username = sanitizeInputFrontend(data.username);
			const password = sanitizeInputFrontend(data.password);

			const validations = {
				username: validateUsernameLogin(username),
				password: validatePasswordLogin(password),
			};

			const hasErrors = (Object.entries(validations) as [keyof LoginFormData, ValidationResult][]).some(
				([field, result]): boolean => handleFieldValidation(field, result, setError),
			);

			if (hasErrors) {
				return;
			}

			const response = (await signIn('credentials', {
				redirect: false,
				username,
				password,
			})) as { ok: boolean; error?: string; status?: number } | undefined;

			if (!response) {
				toast.error('Login failed: unknown error');
				return;
			}

			if (response.error) {
				toast.error('Invalid username or password');
				return;
			}

			toast.success('Login successful!');
			void router.push('/home');
		} catch (err: unknown) {
			toast.error('Unexpected error occurred');
			console.error('Login error:', err);
		}
	};

	return { submitLogin };
};

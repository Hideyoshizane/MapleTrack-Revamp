'use client';

import { signIn } from 'next-auth/react';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';

import { sanitizeInputFrontend } from '@utils/sanitize/sanitizeInputFrontEnd';
import { validateUsernameLogin, validatePasswordLogin, handleFieldValidation } from '@utils/validation';

import type { LoginFormData } from '@sharedTypes/form';
import type { ValidationResult } from '@utils/validation';
import type { UseFormSetError } from 'react-hook-form';

export const useLogin = (
	setError: UseFormSetError<LoginFormData>
): {
	submitLogin: (data: LoginFormData) => Promise<void>;
	justLoggedIn: boolean;
} => {
	// Track if the user just logged in successfully on this page
	const [justLoggedIn, setJustLoggedIn] = useState(false);

	const submitLogin = useCallback(
		async (data: LoginFormData): Promise<void> => {
			try {
				// Sanitize input to avoid XSS
				const username = sanitizeInputFrontend(data.username);
				const password = sanitizeInputFrontend(data.password);

				// Client-side validation
				const validations = {
					username: validateUsernameLogin(username),
					password: validatePasswordLogin(password),
				};

				// If any validation fails, set errors and abort submission
				const hasErrors = (Object.entries(validations) as [keyof LoginFormData, ValidationResult][]).some(
					([field, result]): boolean => handleFieldValidation(field, result, setError)
				);
				if (hasErrors) return;

				// Use NextAuth signIn with credentials
				const res = await signIn('credentials', { redirect: false, username, password });

				if (res?.error) {
					toast.error(res.error);
				} else {
					// Mark fresh login to avoid redirect in effect
					setJustLoggedIn(true);
					toast.success('Login successful!');
					// redirect after login success
					// Used instead of router to force page reload and theme cookie change.
					window.location.href = '/home';
				}
			} catch (err) {
				toast.error('Unexpected error occurred');
				console.error('Login error:', err);
			}
		},
		[setError]
	);

	return { submitLogin, justLoggedIn };
};

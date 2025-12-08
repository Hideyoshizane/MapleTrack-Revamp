// hooks/useChangePassword.ts
import { signOut } from 'next-auth/react';
import { useCallback } from 'react';
import { toast } from 'react-toastify';

import { handleFieldValidation } from '@/utils/validateField';
import { sanitizeInputFrontend } from '@utils/sanitizeInputFrontEnd';
import { validatePassword, validatePasswordConfirmation } from '@utils/validators';
import { fetchWithTimeout } from '@utils/withTimeout';

import type { ApiResponse } from '@sharedTypes/api';
import type { ChangePasswordFormData } from '@sharedTypes/form';
import type { ValidationResult } from '@utils/validateField';
import type { UseFormSetError } from 'react-hook-form';

type UseChangePasswordProps = {
	username: string;
	setError: UseFormSetError<ChangePasswordFormData>;
};

type UseChangePasswordReturn = {
	onSubmit: (data: ChangePasswordFormData) => Promise<void>;
};

export const useChangePassword = ({ username, setError }: UseChangePasswordProps): UseChangePasswordReturn => {
	const onSubmit = useCallback(
		async (data: ChangePasswordFormData): Promise<void> => {
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
					([field, result]): boolean => handleFieldValidation(field, result, setError)
				);
				if (hasErrors) return;

				const payload = { username, currentPassword, newPassword };

				const response = await fetchWithTimeout('/api/auth/change-password', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				});

				const result = (await response.json()) as ApiResponse;

				if (response.ok && result.success) {
					toast.success('Password changed successfully.');
					await signOut({ callbackUrl: '/login' });
				} else if (!result.success) {
					toast.error(result.message || 'Failed to change password');
					if (result.message) {
						for (const [field, msg] of Object.entries(result.message)) {
							setError(field as keyof ChangePasswordFormData, { message: msg ?? 'Invalid input' });
						}
					}
				} else {
					toast.error('Failed to change password');
				}
			} catch (error: unknown) {
				const isAbort = (error as DOMException)?.name === 'AbortError';
				toast.error(isAbort ? 'Request timed out. Please try again.' : 'Unexpected error occurred');
				if (!isAbort) console.error('Change password error:', error);
			}
		},
		[username, setError]
	);

	return { onSubmit };
};

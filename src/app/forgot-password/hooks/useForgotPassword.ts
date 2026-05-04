'use client';

import { toast } from 'react-toastify';

import { forgotPasswordRequestSchema } from '@features/user/schemas/user.schema';
import { userApi } from '@features/user/userApi';

import type { ForgotPasswordFormData } from '@sharedTypes/form';

export const useForgotPassword = (): {
	submitForgotPassword: (data: ForgotPasswordFormData) => Promise<void>;
} => {
	const submitForgotPassword = async (data: ForgotPasswordFormData): Promise<void> => {
		try {
			const parsedResult = forgotPasswordRequestSchema.safeParse(data);
			if (!parsedResult.success) {
				toast.error('Invalid input.');

				return;
			}

			const email = parsedResult.success ? parsedResult.data.email : data.email;

			const result = await userApi.forgotPassword({ email });
			if (result.success) {
				toast.success(result.message ?? 'If an account exists, a reset link was sent.');

				return;
			}

			toast.error(result.message ?? 'Failed to process your request');
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

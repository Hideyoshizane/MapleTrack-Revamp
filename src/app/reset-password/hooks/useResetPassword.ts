'use client';
import { useRouter } from 'next/navigation';
import { useForm, type Control, type UseFormHandleSubmit, type UseFormGetValues } from 'react-hook-form';
import { toast } from 'react-toastify';

import { resetPasswordRequestSchema } from '@features/user/schemas/user.schema';
import { userApi } from '@features/user/userApi';

import type { ResetPasswordFormData } from '@sharedTypes/form';
import type { Id } from 'react-toastify';

type UseResetPasswordReturn = {
	control: Control<ResetPasswordFormData>;
	handleSubmit: UseFormHandleSubmit<ResetPasswordFormData>;
	isSubmitting: boolean;
	isSubmitted: boolean;
	getValues: UseFormGetValues<ResetPasswordFormData>;
	onSubmit: (data: ResetPasswordFormData) => Promise<void>;
};

export const useResetPassword = (rawToken: string): UseResetPasswordReturn => {
	const router = useRouter();

	const {
		control,
		handleSubmit,
		formState: { isSubmitting, isSubmitted },
		getValues,
	} = useForm<ResetPasswordFormData>({ mode: 'onBlur', defaultValues: { password: '', confirmPassword: '' } });

	// helper to avoid repeated toast calls
	const showResetError = (msg?: string): Id => toast.error(msg ?? 'Failed to reset the password');

	const onSubmit = async (data: ResetPasswordFormData): Promise<void> => {
		try {
			if (!rawToken) {
				toast.error('Invalid or missing token.');

				return;
			}

			const parsedResult = resetPasswordRequestSchema.safeParse({ token: rawToken, password: data.password });
			if (!parsedResult.success) {
				toast.error('Invalid input.');

				return;
			}

			const password = parsedResult.success ? parsedResult.data.password : data.password;

			const payload = { token: rawToken, password };
			const result = await userApi.resetPassword(payload);
			if (result.success) {
				router.push('/login?reset=1');

				return;
			}

			toast.error(result.message ?? 'Failed to reset the password');
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

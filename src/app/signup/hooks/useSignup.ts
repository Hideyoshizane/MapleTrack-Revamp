'use client';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useForm, type Control, type UseFormHandleSubmit, type UseFormGetValues } from 'react-hook-form';
import { toast } from 'react-toastify';

import { signupRequestSchema } from '@features/user/schemas/user.schema';
import { userApi } from '@features/user/userApi';
import { mapZodErrorsToForm } from '@utils/validateField';

import type { ApiResponse } from '@sharedTypes/api';
import type { SignupFormData } from '@sharedTypes/form';

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
			const parsedResult = signupRequestSchema.safeParse(data);
			if (!parsedResult.success) {
				mapZodErrorsToForm(parsedResult.error, setError);
				toast.error('Invalid input.');

				return;
			}

			const result = await userApi.signUp(parsedResult.data);
			if (result.success) {
				router.push('/login?success=1');

				return;
			}

			if (typeof result.message === 'string') {
				toast.error(result.message);
			} else {
				toast.error('Signup failed');
			}

			if (result.message && typeof result.message === 'object') {
				for (const [field, msg] of Object.entries(result.message)) {
					setError(field as keyof SignupFormData, {
						type: 'manual',
						message: typeof msg === 'string' ? msg : 'Invalid input',
					});
				}
			}
		} catch (error: unknown) {
			if (axios.isAxiosError<ApiResponse>(error)) {
				if (error.code === 'ECONNABORTED') {
					toast.error('Request timed out. Please try again.');

					return;
				}

				if (!error.response) {
					toast.error('Network error. Please check your connection.');

					return;
				}

				toast.error(error.response.data?.message ?? 'Signup failed');

				return;
			}

			console.error('[Signup] Unexpected error', error);
			toast.error('Unexpected error occurred');
		}
	};

	return { control, handleSubmit, isSubmitting, isSubmitted, isValid, getValues, onSubmit };
};

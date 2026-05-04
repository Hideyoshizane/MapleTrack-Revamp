'use client';

import { signIn } from 'next-auth/react';
import { toast } from 'react-toastify';

import { credentialsSchema } from '@features/user/schemas/user.schema';

import type { LoginFormData } from '@sharedTypes/form';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export const useLogin = (router: AppRouterInstance): { submitLogin: (data: LoginFormData) => Promise<void> } => {
	const submitLogin = async (data: LoginFormData): Promise<void> => {
		try {
			const parsed = credentialsSchema.safeParse(data);

			const username = parsed.success ? parsed.data.username : data.username;
			const password = parsed.success ? parsed.data.password : data.password;

			const response = (await signIn('credentials', { redirect: false, username, password })) as
				| { ok: boolean; error?: string | null }
				| undefined;

			if (!response || response.error) {
				toast.error('Invalid username or password');

				return;
			}

			toast.success('Login successful!');
			void router.push('/home');
		} catch (err: unknown) {
			toast.error('Invalid username or password');
			console.error('Login error:', err);
		}
	};

	return { submitLogin };
};

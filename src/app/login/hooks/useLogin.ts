'use client';

import { toast } from 'sonner';

import { credentialsSchema } from '@features/user/schemas/user.schema';

import type { LoginFormData } from '@sharedTypes/form';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export const useLogin = (router: AppRouterInstance): { submitLogin: (data: LoginFormData) => Promise<void> } => {
	const submitLogin = async (data: LoginFormData): Promise<void> => {
		try {
			const parsed = credentialsSchema.safeParse(data);
			if (!parsed.success) {
				toast.error('Invalid name or password');
				return;
			}

			// Authentication endpoint that accepts name(username)
			const response = await fetch('/api/auth/signin', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(parsed.data),
			});
			if (!response.ok) {
				toast.error('Invalid name or password');
				return;
			}

			toast.success('Login successful!');
			void router.push('/home');

			router.refresh();
		} catch (error: unknown) {
			toast.error('Invalid name or password');
			console.error('Login error:', error);
		}
	};

	return { submitLogin };
};

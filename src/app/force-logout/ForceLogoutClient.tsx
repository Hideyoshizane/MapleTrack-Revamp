'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { authClient } from '@lib/authClient';

const ForceLogoutPage = (): null => {
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect((): void => {
		const reason = searchParams.get('reason');

		const callbackUrl = reason === 'version_update' ? '/login?version_update=1' : '/login';

		void authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.replace(callbackUrl);
				},
				onError: () => {
					router.replace(callbackUrl);
				},
			},
		});
	}, [router, searchParams]);

	return null;
};

export default ForceLogoutPage;

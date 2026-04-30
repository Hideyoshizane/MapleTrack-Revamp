// src/app/force-logout/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useEffect } from 'react';

const ForceLogoutPage = (): null => {
	const searchParams = useSearchParams();

	useEffect((): void => {
		const reason = searchParams.get('reason');

		const callbackUrl = reason === 'version_update' ? '/login?version_update=1' : '/login';

		void signOut({ callbackUrl });
	}, [searchParams]);

	return null;
};

export default ForceLogoutPage;

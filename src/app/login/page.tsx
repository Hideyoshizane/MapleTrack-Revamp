import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';

import LoginPageClient from './LoginPageClient';

import type { JSX } from 'react';

const LoginPage = async (): Promise<JSX.Element> => {
	// Redirect to home if user is logged
	const session = await auth.api.getSession({ headers: await headers() });
	if (session?.user?.id) {
		redirect('/home?logged=1');
	}

	return <LoginPageClient />;
};

export default LoginPage;

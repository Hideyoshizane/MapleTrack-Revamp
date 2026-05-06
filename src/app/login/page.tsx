import { redirect } from 'next/navigation';

import { auth } from '@/auth';

import LoginPageClient from './LoginPageClient';

import type { JSX } from 'react';

const LoginPage = async (): Promise<JSX.Element> => {
	const session = await auth();

	if (session?.user?.id) {
		redirect('/home?logged=1');
	}

	return <LoginPageClient />;
};

export default LoginPage;

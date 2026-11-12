import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';

import Navbar from '@components/Navbar/Navbar';

import AccountPageClient from './AccountPageClient';

import type { JSX } from 'react';

const AccountPage = async (): Promise<JSX.Element> => {
	// If no session, redirect to login with a query param
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user?.id) {
		redirect('/login?unauthorized=1');
	}

	return (
		<main className="container">
			<Navbar username={session.user.name} />
			<AccountPageClient />
		</main>
	);
};

export default AccountPage;

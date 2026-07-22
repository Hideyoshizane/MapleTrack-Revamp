import { redirect } from 'next/navigation';

import { auth } from '@/auth';

import Navbar from '@components/Navbar/Navbar';

import AccountPageClient from './AccountPageClient';

import type { JSX } from 'react';

const AccountPage = async (): Promise<JSX.Element> => {
	const session = await auth();

	// If no session, redirect to login with a query param
	if (!session?.user?.id) {
		redirect('/login?unauthorized=1');
	}

	return (
		<main className="container">
			<Navbar username={session.user.username} />
			<AccountPageClient />
		</main>
	);
};

export default AccountPage;

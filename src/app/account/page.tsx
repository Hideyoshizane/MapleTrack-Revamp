import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/authOptions';
import Navbar from '@components/Navbar/Navbar';

import AccountPageClient from './AccountPageClient';

interface AccountPage {
	searchParams?: Record<string, string | undefined>;
}

export default async function AccountPage({ searchParams }: AccountPage) {
	const session = await getServerSession(authOptions);

	// If no session, redirect to login with a query param
	if (!session) {
		redirect('/login?unauthorized=1');
	}

	return (
		<main className="container">
			<Navbar username={session.user.username} />
			<AccountPageClient searchParams={searchParams} username={session.user.username} />
		</main>
	);
}

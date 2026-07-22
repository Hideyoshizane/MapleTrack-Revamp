import { redirect } from 'next/navigation';

import { auth } from '@/auth';

import Navbar from '@components/Navbar/Navbar';
import { resolveServerFromCookies } from '@data/servers/resolveServerFromCookies';

import EditWeeklyPageClient from './EditWeeklyPageClient';

import type { JSX } from 'react';

const editWeeklyBossPage = async (): Promise<JSX.Element> => {
	const session = await auth();

	// If no session, redirect to login with a query param
	if (!session?.user?.id) {
		redirect('/login?unauthorized=1');
	}

	const initialServer = await resolveServerFromCookies();

	return (
		<main className="container">
			<Navbar username={session.user.username} />
			<EditWeeklyPageClient initialServer={initialServer} />
		</main>
	);
};

export default editWeeklyBossPage;

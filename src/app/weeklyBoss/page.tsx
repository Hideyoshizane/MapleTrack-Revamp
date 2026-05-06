import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import Navbar from '@components/Navbar/Navbar';
import { resolveServerFromCookies } from '@data/servers/resolveServerFromCookies';

import WeeklyPageClient from './WeeklyPageClient';

import type { JSX } from 'react';

const WeeklyBossPage = async (): Promise<JSX.Element> => {
	const session = await auth();

	const initialServer = await resolveServerFromCookies();

	// If no session, redirect to login with a query param
	if (!session?.user?.id) {
		redirect('/login?unauthorized=1');
	}

	return (
		<main className="container">
			<Navbar username={session.user.username} />
			<WeeklyPageClient initialServer={initialServer} />
		</main>
	);
};

export default WeeklyBossPage;

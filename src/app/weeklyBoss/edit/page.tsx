import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import Navbar from '@components/Navbar/Navbar';
import { resolveServerFromCookies } from '@data/servers/resolveServerFromCookies';

import EditWeeklyPageClient from './EditWeeklyPageClient';

import type { JSX } from 'react';

const HomePage = async (): Promise<JSX.Element> => {
	const session = await auth();

	// If no session, redirect to login with a query param
	if (!session) {
		redirect('/login?unauthorized=1');
	}

	const initialServer = await resolveServerFromCookies();

	// Execute function here to update weekly bosses.
	// Function here

	return (
		<main className="container">
			<Navbar username={session.user.username} />
			<EditWeeklyPageClient username={session.user.username} initialServer={initialServer} />
		</main>
	);
};

export default HomePage;

import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import Navbar from '@components/Navbar/navbar';
import { resolveServerFromCookies } from '@data/servers/resolveServerFromCookies';

import LiberationClient from './liberationClient';

import type { JSX } from 'react';

const LiberationPage = async (): Promise<JSX.Element> => {
	const session = await auth();

	const initialServer = await resolveServerFromCookies();

	// If no session, redirect to login
	if (!session?.user?.id) {
		redirect('/login?unauthorized=1');
	}

	return (
		<main className="container">
			<Navbar username={session.user.username} />

			<LiberationClient initialServer={initialServer} />
		</main>
	);
};

export default LiberationPage;

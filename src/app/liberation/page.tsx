import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';

import Navbar from '@components/Navbar/Navbar';
import { resolveServerFromCookies } from '@data/servers/resolveServerFromCookies';

import LiberationClient from './LiberationClient';

import type { JSX } from 'react';

const LiberationPage = async (): Promise<JSX.Element> => {
	const initialServer = await resolveServerFromCookies();

	// If no session, redirect to login
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user?.id) {
		redirect('/login?unauthorized=1');
	}

	return (
		<main className="container">
			<Navbar username={session.user.name} />

			<LiberationClient initialServer={initialServer} />
		</main>
	);
};

export default LiberationPage;

import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import Navbar from '@components/Navbar/Navbar';
import { resolveServerFromCookies } from '@data/servers/resolveServerFromCookies';

import HomePageClient from './HomePageClient';

import type { JSX } from 'react';

type HomePageProps = {
	searchParams?: Record<string, string | undefined>;
};

const HomePage = async ({ searchParams }: HomePageProps): Promise<JSX.Element> => {
	const session = await auth();

	const initialServer = await resolveServerFromCookies();

	// If no session, redirect to login
	if (!session) {
		redirect('/login?unauthorized=1');
	}

	return (
		<main className="container">
			<Navbar username={session.user.username} />
			<HomePageClient searchParams={searchParams} username={session.user.username} initialServer={initialServer} />
		</main>
	);
};

export default HomePage;

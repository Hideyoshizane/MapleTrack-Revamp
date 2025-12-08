import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import Navbar from '@components/Navbar/Navbar';

import HomePageClient from './HomePageClient';

import type { JSX } from 'react';

type HomePageProps = {
	searchParams?: Record<string, string | undefined>;
};

const HomePage = async ({ searchParams }: HomePageProps): Promise<JSX.Element> => {
	const session = await auth();

	// If no session, redirect to login with a query param
	if (!session) {
		redirect('/login?unauthorized=1');
	}

	return (
		<main className="container">
			<Navbar username={session.user.username} />
			<HomePageClient searchParams={searchParams} username={session.user.username} />
		</main>
	);
};

export default HomePage;

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import Navbar from '@components/Navbar/Navbar';
import { authOptions } from '@lib/authOptions';

import WeeklyPageClient from './WeeklyPageClient';

import type { JSX } from 'react';

interface HomePageProps {
	searchParams?: Record<string, string | undefined>;
}

const HomePage = async ({ searchParams }: HomePageProps): Promise<JSX.Element> => {
	const session = await getServerSession(authOptions);

	// If no session, redirect to login with a query param
	if (!session) {
		redirect('/login?unauthorized=1');
	}

	// Execute function here to updat weekly bosses.
	// Function here

	return (
		<main className="container">
			<Navbar username={session.user.username} />
			<WeeklyPageClient searchParams={searchParams} username={session.user.username} />
		</main>
	);
};

export default HomePage;

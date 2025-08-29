import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/authOptions';
import Navbar from '@components/Navbar/Navbar';

import HomePageClient from './HomePageClient';

interface HomePageProps {
	searchParams?: Record<string, string | undefined>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
	const session = await getServerSession(authOptions);

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
}

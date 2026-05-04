import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import Navbar from '@components/Navbar/navbar';
import { resolveServerFromCookies } from '@data/servers/resolveServerFromCookies';

import HomePageClient from './homePageClient';

import type { JSX } from 'react';

type Props = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const HomePage = async ({ searchParams }: Props): Promise<JSX.Element> => {
	const resolvedSearchParams = await searchParams;

	const session = await auth();

	const initialServer = await resolveServerFromCookies();

	// If no session, redirect to login
	if (!session) {
		redirect('/login?unauthorized=1');
	}

	return (
		<main className="container">
			<Navbar username={session.user.username} />
			<HomePageClient initialServer={initialServer} searchParams={resolvedSearchParams} />
		</main>
	);
};

export default HomePage;

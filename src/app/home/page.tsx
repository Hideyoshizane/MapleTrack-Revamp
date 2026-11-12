import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';

import Navbar from '@components/Navbar/Navbar';
import { resolveServerFromCookies } from '@data/servers/resolveServerFromCookies';

import HomePageClient from './HomePageClient';

import type { JSX } from 'react';

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

const HomePage = async ({ searchParams }: Props): Promise<JSX.Element> => {
	const resolvedSearchParams = await searchParams;

	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user?.id) {
		redirect('/login?unauthorized=1');
	}

	const initialServer = await resolveServerFromCookies();

	return (
		<main className="container">
			<Navbar username={session.user.name} />
			<HomePageClient initialServer={initialServer} searchParams={resolvedSearchParams} />
		</main>
	);
};

export default HomePage;

export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import Navbar from '@components/Navbar/Navbar';

import CharacterPage from './CharacterPage';

import type { JSX } from 'react';

type CharactersPageProps = {
	params: Promise<{ server: string; code: string }>;
};

const CharactersPage = async ({ params }: CharactersPageProps): Promise<JSX.Element> => {
	const { server, code } = await params;

	// Redirect to login if not autenthicated
	const session = await auth();
	if (!session) {
		redirect('/login?unauthorized=1');
	}

	return (
		<main className="container">
			<Navbar username={session.user.username} />
			<CharacterPage server={server} code={code} />
		</main>
	);
};

export default CharactersPage;

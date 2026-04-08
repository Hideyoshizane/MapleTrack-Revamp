export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import Navbar from '@components/Navbar/Navbar';

import { BonusProvider } from './BonusContext';
import CharacterPage from './CharacterPage';

import type { JSX } from 'react';

type CharactersPageProps = {
	params: Promise<{ server: string; code: string }>;
};

const CharactersPage = async ({ params }: CharactersPageProps): Promise<JSX.Element> => {
	const { server, code } = await params;

	const session = await auth();
	if (!session) {
		redirect('/login?unauthorized=1');
	}

	return (
		<main className="container">
			<Navbar username={session.user.username} />
			<BonusProvider>
				<CharacterPage server={server} code={code} />
			</BonusProvider>
		</main>
	);
};

export default CharactersPage;

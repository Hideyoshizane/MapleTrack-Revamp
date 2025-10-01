import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import Navbar from '@components/Navbar/Navbar';
import { authOptions } from '@lib/authOptions';
import { validateUserAccess, syncCharacterInfo } from '@lib/characters';

import { BonusProvider } from './BonusContext';
import CharacterPage from './CharacterPage';

import type { JSX } from 'react';

interface CharactersPageProps {
	params: Promise<{ userOrigin: string; server: string; code: string }>;
}

const CharactersPage = async ({ params }: CharactersPageProps): Promise<JSX.Element> => {
	const { userOrigin, server, code } = await params;

	const session = await getServerSession(authOptions);
	if (!session) {
		redirect('/login?unauthorized=1');
	}

	// Validate if user is trying to access its own data
	const isValid = validateUserAccess({ userOrigin, server, code }, session.user.username);
	if (!isValid) {
		redirect('/home?unauthorized=1');
	}
	// Fetch character data
	await syncCharacterInfo({
		userOrigin: userOrigin,
		server: server,
		code: code,
	});

	return (
		<main className="container">
			<Navbar username={session.user.username} />
			<BonusProvider>
				<CharacterPage userOrigin={userOrigin} server={server} code={code} />
			</BonusProvider>
		</main>
	);
};

export default CharactersPage;

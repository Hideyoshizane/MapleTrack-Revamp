import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import Navbar from '@components/Navbar/Navbar';
import { validateUserAccess, syncCharacterInfo } from '@lib/characters';

import CharacterPage from './CharacterPage';

import type { JSX } from 'react';

type CharactersPageProps = {
	params: Promise<{ userOrigin: string; server: string; code: string }>;
};

const CharactersPage = async ({ params }: CharactersPageProps): Promise<JSX.Element> => {
	const { userOrigin, server, code } = await params;

	// Redirect to login if not autenthicated
	const session = await auth();
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
			<CharacterPage userOrigin={userOrigin} server={server} code={code} />
		</main>
	);
};

export default CharactersPage;

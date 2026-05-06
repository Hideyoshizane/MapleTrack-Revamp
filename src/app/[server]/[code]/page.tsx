export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import Navbar from '@components/Navbar/Navbar';

import { BonusProvider } from './BonusContext';
import CharacterPage from './CharacterPage';

import type { JSX } from 'react';

type Props = {
	params: Promise<{ server: string; code: string }>;
};

const CharactersPage = async ({ params }: Props): Promise<JSX.Element> => {
	const { server, code } = await params;

	const session = await auth();
	if (!session?.user?.id) {
		redirect('/login?unauthorized=1');
	}

	return (
		<main className="container">
			<Navbar username={session.user.username} />
			<BonusProvider>
				<CharacterPage code={code} server={server} />
			</BonusProvider>
		</main>
	);
};

export default CharactersPage;

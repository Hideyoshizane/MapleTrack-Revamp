import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/authOptions';
import Navbar from '@components/Navbar/Navbar';

import { BonusProvider } from './BonusContext';
import CharacterPage from './CharacterPage';

export default async function CharactersPage() {
	const session = await getServerSession(authOptions);

	// If no session, redirect to login with a query param
	if (!session) {
		redirect('/login?unauthorized=1');
	}

	return (
		<main className="container">
			<Navbar username={session.user.username} />
			<BonusProvider>
				<CharacterPage />
			</BonusProvider>
		</main>
	);
}

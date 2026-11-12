import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';

import Navbar from '@components/Navbar/Navbar';

import EditCharacterPage from './EditCharacterPage';

import type { JSX } from 'react';

type Props = { params: Promise<{ server: string; code: string }> };

const CharactersPage = async ({ params }: Props): Promise<JSX.Element> => {
	const { server, code } = await params;

	// Redirect to login if not autenthicated
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user?.id) {
		redirect('/login?unauthorized=1');
	}

	return (
		<main className="container">
			<Navbar username={session.user.name} />
			<EditCharacterPage code={code} server={server} />
		</main>
	);
};

export default CharactersPage;

// app/page.tsx
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
	// Check for session on the server
	const session = await getServerSession(authOptions);

	// If no session, redirect to login
	if (!session) {
		redirect('/login?unauthorized=1');
	}

	// Render protected content
	return (
		<main>
			<h1>Welcome, {session.user.username}!</h1>
			<p>This is your home page. You are authenticated.</p>
		</main>
	);
}

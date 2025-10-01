import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

// Redirects authenticated users to /home
export const useAuthRedirect = (justLoggedIn: boolean): void => {
	const { status } = useSession();
	const router = useRouter();

	useEffect((): void => {
		if (status === 'authenticated' && !justLoggedIn) {
			router.replace('/home?logged=1');
		}
	}, [status, justLoggedIn, router]);
};

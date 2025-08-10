'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

interface HomePageClientProps {
	searchParams?: Record<string, string | undefined>;
	username: string;
}

export default function HomePageClient({ username }: HomePageClientProps) {
	const router = useRouter();

	const searchParams = useSearchParams();
	const hasShownToast = useRef(false);

	useEffect(() => {
		// Run only once to prevent duplicate toasts
		if (hasShownToast.current) return;

		// If URL has ?logged=1, show toast and remove param
		if (searchParams?.get('logged') === '1') {
			toast.success('Redirected, user already authenticated.');
			hasShownToast.current = true;
			// Remove query params
			router.replace('/home');
		}
	}, [searchParams, router]);

	return (
		<section className="mainContent">
			<h1>Welcome, {username}!</h1>
			<p>This is your home page. You are authenticated.</p>
		</section>
	);
}

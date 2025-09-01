'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

import { ClassFilter } from '@/components/ClassFilter/ClassFilter';
import ClassGrid from '@components/ClassGrid/ClassGrid';
import ServerDropdown from '@components/ServerDropdown/ServerDropdown';
import { useClassFilterCookie } from '@hooks/useClassFilterCookie';
import { useServerCookie } from '@hooks/useServerCookie';

import styles from './page.module.css';

interface HomePageClientProps {
	searchParams?: Record<string, string | undefined>;
	username: string;
}
export default function HomePageClient({ username }: HomePageClientProps) {
	const { server: serverCookie, setServerCookie } = useServerCookie();
	const { selectedClasses, setClasses, loading } = useClassFilterCookie();

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
		// If URL has ?unauthorized=1, show toast and remove param
		if (searchParams?.get('unauthorized') === '1') {
			toast.error('Unauthorized access');
			hasShownToast.current = true;
			// Remove query params
			router.replace('/home');
		}
	}, [searchParams, router]);

	return (
		<section className="mainContent">
			<div className={styles.serverDropdown}>
				<ServerDropdown serverCookie={serverCookie} setServerCookie={setServerCookie} />
			</div>
			<div className={styles.classFilter}>
				<ClassFilter selectedClasses={selectedClasses} setSelectedClasses={setClasses} loading={loading} />
			</div>
			<ClassGrid username={username} serverCookie={serverCookie} selectedClasses={selectedClasses} />
		</section>
	);
}

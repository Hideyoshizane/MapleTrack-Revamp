'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

import { ClassFilter } from '@components/ClassFilter/ClassFilter';
import ClassGrid from '@components/ClassGrid/ClassGrid';
import ServerDropdown from '@components/ServerDropdown/ServerDropdown';
import { useClassFilterCookie } from '@hooks/useClassFilterCookie';
import { useServerCookie } from '@hooks/useServerCookie';

import styles from './page.module.scss';

import type { JSX } from 'react';

interface HomePageClientProps {
	searchParams?: Record<string, string | undefined>;
	username: string;
}

const HomePageClient = ({ username }: HomePageClientProps): JSX.Element => {
	// Cookie hooks
	const { server: serverCookie, setServerCookie } = useServerCookie();
	const { selectedClasses, setClasses, loading } = useClassFilterCookie();

	// Navigation hooks
	const router = useRouter();
	const searchParams = useSearchParams();

	// Ref to avoid duplicate toasts
	const hasShownToast = useRef(false);

	useEffect((): void => {
		if (hasShownToast.current) return;

		if (searchParams?.get('logged') === '1') {
			toast.success('Redirected, user already authenticated.');
			hasShownToast.current = true;
			router.replace('/home');
		} else if (searchParams?.get('unauthorized') === '1') {
			toast.error('Unauthorized access');
			hasShownToast.current = true;
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
			<ClassGrid
				username={username}
				serverCookie={serverCookie}
				selectedClasses={selectedClasses}
				selectedClassesLoading={loading}
			/>
		</section>
	);
};

export default HomePageClient;

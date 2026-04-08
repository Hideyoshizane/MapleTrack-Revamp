'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

import ServerDropdown from '@components/ServerDropdown/ServerDropdown';
import { useServerCookie } from '@hooks/useServerCookie';

import { ClassFilter } from './components/ClassFilter/ClassFilter';
import ClassGrid from './components/ClassGrid/ClassGrid';
import { useClassFilterCookie } from './hooks/useClassFilterCookie';
import styles from './page.module.scss';

import type { ServerName } from '@data/servers/servers';
import type { JSX } from 'react';

type HomePageClientProps = {
	searchParams?: Record<string, string | undefined>;
	initialServer: ServerName;
};

const HomePageClient = ({ initialServer }: HomePageClientProps): JSX.Element => {
	const { server, setServerCookie } = useServerCookie(initialServer);
	const { selectedClasses, setClasses, loading } = useClassFilterCookie();

	const router = useRouter();
	const searchParams = useSearchParams();

	// Ref to avoid duplicate toasts
	const hasShownToast = useRef(false);

	useEffect((): void => {
		if (hasShownToast.current) {
			return;
		}

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
				<ServerDropdown server={server} setServerCookie={setServerCookie} />
			</div>
			<div className={styles.classFilter}>
				<ClassFilter selectedClasses={selectedClasses} setSelectedClasses={setClasses} loading={loading} />
			</div>
			<ClassGrid serverCookie={server} selectedClasses={selectedClasses} selectedClassesLoading={loading} />
		</section>
	);
};

export default HomePageClient;

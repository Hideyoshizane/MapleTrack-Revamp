'use client';

import { useRouter } from 'next/navigation';

import ErrorIcon from '@assets/svg/error.svg';

import styles from '../styles/notFound.module.scss';

import type { JSX } from 'react';

const Error = (): JSX.Element => {
	const ICON_SIZE = 400;

	const router = useRouter();

	const handleBackToHome = (): void => {
		router.push('/home');
	};

	return (
		<div className={styles.page}>
			<main className={styles.main}>
				<ErrorIcon className={styles.icon} height={ICON_SIZE} width={ICON_SIZE} />
				<p className={styles.title}>404 File Not Found</p>
				<p className={styles.text}>The page you requested may have been moved or deleted.</p>
				<button className={styles.displayButton} onClick={handleBackToHome}>
					Back to Home
				</button>
			</main>
		</div>
	);
};

export default Error;

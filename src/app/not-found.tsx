'use client';
import Link from 'next/link';

import ErrorIcon from '@assets/svg/error.svg';

import styles from '../styles/notFound.module.scss';

import type { JSX } from 'react';

const Error = (): JSX.Element => {
	const ICON_SIZE = 400;

	return (
		<div className={styles.page}>
			<main className={styles.main}>
				<ErrorIcon className={styles.icon} height={ICON_SIZE} width={ICON_SIZE} />

				<p className={styles.title}>404 File Not Found</p>
				<p className={styles.text}>The page you requested may have been moved or deleted.</p>

				<Link className={styles.displayButton} href="/home">
					Back to Home
				</Link>
			</main>
		</div>
	);
};

export default Error;

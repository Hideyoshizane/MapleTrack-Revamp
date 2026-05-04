import ErrorIcon from '@assets/svg/octagon-x.svg';

import styles from './errorPage.module.scss';

import type { JSX } from 'react';

const ErrorPage = (): JSX.Element => {
	return (
		<div className={styles.mainBody}>
			<p className={styles.title}>Internal Server Error</p>

			<ErrorIcon className={styles.icon} />

			<p className={styles.infoText}>An error has ocurred and could not complete your request.</p>
		</div>
	);
};

export default ErrorPage;

'use client';

import Loader from '@components/Loader/loader';

import styles from './fullPageLoader.module.scss';

import type { JSX } from 'react';

type Props = {
	width?: number;
	height?: number;
	color?: string;
	borderWidth?: number;
};

const FullPageLoader = ({
	width = 120,
	height = 120,
	color = 'var(--default-black)',
	borderWidth = 12,
}: Props): JSX.Element => {
	return (
		<div className={styles.mainDiv}>
			<div className={styles.loaderDiv}>
				<Loader borderWidth={borderWidth} color={color} height={height} width={width} />
			</div>
		</div>
	);
};

export default FullPageLoader;

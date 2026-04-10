'use client';

import Loader from '@components/Loader/loader';

import styles from './fullPageLoader.module.scss';

import type { JSX } from 'react';

type FullPageLoaderProps = {
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
}: FullPageLoaderProps): JSX.Element => {
	return (
		<section className="mainContent">
			<div className={styles.mainDiv}>
				<div className={styles.loaderDiv}>
					<Loader width={width} height={height} color={color} borderWidth={borderWidth} />
				</div>
			</div>
		</section>
	);
};

export default FullPageLoader;

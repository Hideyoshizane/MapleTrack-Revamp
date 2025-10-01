'use client';

import React from 'react';

import Loader from '@components/Loader/Loader';

import styles from './FullPageLoader.module.scss';

import type { FC, JSX } from 'react';

interface FullPageLoaderProps {
	width?: number;
	height?: number;
	color?: string;
	borderWidth?: number;
}

const FullPageLoader: FC<FullPageLoaderProps> = ({
	width = 120,
	height = 120,
	color = 'var(--default-black)',
	borderWidth = 12,
}): JSX.Element => {
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

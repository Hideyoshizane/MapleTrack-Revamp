import Image from '@components/Image/Image';

import styles from '../../styles/Root.module.scss';

import type { JSX, ReactNode } from 'react';

type Props = { backgroundSrc: string; children: ReactNode; preload?: boolean };

const LandingSection = ({ backgroundSrc, children, preload }: Props): JSX.Element => {
	return (
		<section className={styles.block}>
			<div className={styles.content}>{children}</div>

			<Image className={styles.backgroundImage} alt="" fill preload={preload} src={backgroundSrc} />
		</section>
	);
};

export default LandingSection;

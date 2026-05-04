import Image from 'next/image';

import styles from '../../styles/root.module.scss';

import type { JSX, ReactNode } from 'react';

type Props = {
	backgroundSrc: string;
	children: ReactNode;
	priority?: boolean;
};

const LandingSection = ({ backgroundSrc, children, priority }: Props): JSX.Element => {
	return (
		<section className={styles.block}>
			<div className={styles.content}>{children}</div>

			<Image className={styles.backgroundImage} alt="" fill priority={priority} src={backgroundSrc} />
		</section>
	);
};

export default LandingSection;

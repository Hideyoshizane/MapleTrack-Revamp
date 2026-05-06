import Image from 'next/image';

import styles from '../../styles/Root.module.scss';

import type { JSX } from 'react';

type Props = {
	title: string;
	descriptions: string[];
	imageSrc: string;
	reverse?: boolean;
};

const LandingShowcase = ({ title, descriptions, imageSrc, reverse = false }: Props): JSX.Element => {
	return (
		<div className={styles.showcaseDiv} data-reverse={reverse}>
			<Image className={styles.showcaseImage} alt="" height={441} src={imageSrc} width={896} />

			<div className={styles.showcaseTextDiv}>
				<p className={styles.showcaseTitle}>{title}</p>

				{descriptions.map((text) => (
					<p className={styles.showcaseDescription} key={text}>
						{text}
					</p>
				))}
			</div>
		</div>
	);
};

export default LandingShowcase;

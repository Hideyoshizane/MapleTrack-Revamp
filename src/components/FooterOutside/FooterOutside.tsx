import styles from './footerOutside.module.scss';

import type { JSX } from 'react';

const FooterOutside = (): JSX.Element => {
	return (
		<footer className={styles.footer}>
			<p>MapleTrack is an unofficial, fan-made project and not associated with Nexon.</p>
			<p>All assets and trademarks are © their respective owners.</p>
			<p>
				Made by Hideyoshi. Check the{' '}
				<a href="https://github.com/Hideyoshizane/MapleTrack-Revamp" rel="noopener noreferrer" target="_blank">
					GitHub
				</a>{' '}
				for more info.
			</p>
		</footer>
	);
};

export default FooterOutside;

import React from 'react';
import styles from './FooterOutside.module.css';

const FooterOutside = () => {
	return (
		<footer className={styles.footer}>
			<p>MapleTrack is an unofficial, fan-made project and not associated with Nexon.</p>
			<p>All assets and trademarks are © their respective owners.</p>
			<p>
				Made by Hideyoshi. Check the{' '}
				<a href="https://github.com/Hideyoshizane/MapleTrack-Revamp" target="_blank" rel="noopener noreferrer">
					GitHub
				</a>{' '}
				for more info.
			</p>
		</footer>
	);
};

export default FooterOutside;

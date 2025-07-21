import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import Timer from '@components/Timer/Timer';

import styles from './Navbar.module.css';

const version = process.env.APP_VERSION;

interface MyComponentProps {
	title: string;
}

const Navbar: React.FC<MyComponentProps> = () => {
	return (
		<nav className={styles.navBody}>
			<Link href="/home">
				<div className={styles.logoDiv}>
					<Image src="/assets/logo/logo.webp" fill alt="MapleTrack Logo" />
					<p className={styles.version}>{version}</p>
				</div>
			</Link>
			<Timer target="daily" />
			<Timer target="weekly" />
		</nav>
	);
};

export default Navbar;

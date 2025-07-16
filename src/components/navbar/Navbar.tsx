import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import styles from './Navbar.module.css';

const version = process.env.APP_VERSION;

interface MyComponentProps {
	title: string;
	subtitle?: string;
	children?: React.ReactNode;
}

const Navbar: React.FC<MyComponentProps> = () => {
	return (
		<nav className={styles.navBody}>
			<Link href="/home">
				<div className={styles.logoDiv}>
					<Image src="/assets/logo/logo.webp" width={200} height={80} alt="MapleTrack Logo" />
					<p className={styles.version}>{version}</p>
				</div>
			</Link>
		</nav>
	);
};

export default Navbar;

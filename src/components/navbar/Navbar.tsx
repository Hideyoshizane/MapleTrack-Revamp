import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import Timer from '@components/Timer/Timer';

import { CustomDropdownMenu } from './DropdownMenu/DropdownMenu';
import styles from './Navbar.module.css';
import SearchBar from './SearchBar/SearchBar';

const version = process.env.APP_VERSION;

interface NavbarProps {
	username: string;
}

const Navbar: React.FC<NavbarProps> = ({ username }) => {
	return (
		<nav className={styles.navBody}>
			<Link href="/home">
				<div className={styles.logoDiv}>
					<Image src="/assets/logo/logo.webp" priority fill sizes="312px" alt="MapleTrack Logo" />
					<p className={styles.version}>{version}</p>
				</div>
			</Link>
			<Timer target="daily" />
			<SearchBar />
			<Timer target="weekly" />
			<CustomDropdownMenu username={username} />
		</nav>
	);
};

export default Navbar;

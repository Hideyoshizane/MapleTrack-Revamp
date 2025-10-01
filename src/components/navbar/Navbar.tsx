import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import Timer from '@components/Timer/Timer';
import { APP_VERSION } from '@lib/version';

import CustomDropdownMenu from './DropdownMenu/CustomDropdownMenu';
import styles from './Navbar.module.scss';
import SearchBar from './SearchBar/SearchBar';

import type { JSX } from 'react';

const version = APP_VERSION;

interface NavbarProps {
	username: string;
}

const Navbar: React.FC<NavbarProps> = ({ username }): JSX.Element => {
	return (
		<nav className={styles.navBody}>
			<Link href="/home">
				<div className={styles.logoDiv}>
					<Image src="/assets/logo/logo-nav.webp" priority fill sizes="312px" alt="MapleTrack Logo" />
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

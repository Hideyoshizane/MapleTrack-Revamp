'use client';

import Image from 'next/image';
import Link from 'next/link';

import Timer from '@components/Timer/timer';
import { APP_VERSION } from '@lib/config/version';

import CustomDropdownMenu from './DropdownMenu/customDropdownMenu';
import styles from './navbar.module.scss';
import SearchBar from './SearchBar/searchBar';

import type { JSX } from 'react';

type Props = {
	username: string;
};

const Navbar = ({ username }: Props): JSX.Element => {
	return (
		<nav className={styles.navBody}>
			<Link className={styles.logoDiv} aria-label="Go to home" href="/home">
				<Image alt="MapleTrack Logo" fill priority sizes="312px" src="/assets/logo/logo-nav.webp" />
				<p className={styles.version}>{APP_VERSION}</p>
			</Link>

			<Timer target="daily" />

			<SearchBar />

			<Timer target="weekly" />

			<CustomDropdownMenu username={username} />
		</nav>
	);
};

export default Navbar;

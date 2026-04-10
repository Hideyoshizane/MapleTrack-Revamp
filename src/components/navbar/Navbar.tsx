'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import Timer from '@components/Timer/timer';
import { APP_VERSION } from '@lib/config/version';

import CustomDropdownMenu from './DropdownMenu/customDropdownMenu';
import styles from './navbar.module.scss';
import SearchBar from './SearchBar/searchBar';

import type { JSX } from 'react';

type NavbarProps = {
	username: string;
};

const Navbar = ({ username }: NavbarProps): JSX.Element => {
	const router = useRouter();

	const handleLogoClick = (): void => {
		router.push('/home');
	};

	return (
		<nav className={styles.navBody}>
			<button type="button" onClick={handleLogoClick} className={styles.logoDiv} aria-label="Go to home">
				<Image src="/assets/logo/logo-nav.webp" priority fill sizes="312px" alt="MapleTrack Logo" />
				<p className={styles.version}>{APP_VERSION}</p>
			</button>
			<Timer target="daily" />
			<SearchBar />
			<Timer target="weekly" />
			<CustomDropdownMenu username={username} />
		</nav>
	);
};

export default Navbar;

'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { signOut } from 'next-auth/react';

import LogOutIcon from '@assets/svg/log-out.svg';
import { useTheme } from '@context/useTheme';

import { DROPDOWN_ICON_SIZE } from './constants';
import styles from './dropdownMenuCommon.module.scss';

import type { JSX } from 'react';

const LogoutButton = (): JSX.Element => {
	const { setTheme } = useTheme();

	const handleLogout = async (): Promise<void> => {
		try {
			await signOut({ callbackUrl: '/login' });
			setTheme('dark');
		} catch (error) {
			console.error('Logout failed:', error);
		}
	};

	return (
		<DropdownMenu.Item
			className={styles.dropdownItem}
			onSelect={(): undefined => void handleLogout()}
			aria-label="Logout">
			<LogOutIcon width={DROPDOWN_ICON_SIZE} height={DROPDOWN_ICON_SIZE} className={styles.icon} />
			<span className={styles.text}>Logout</span>
		</DropdownMenu.Item>
	);
};

export default LogoutButton;

'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { signOut } from 'next-auth/react';
import React from 'react';

import LogOutIcon from '@assets/svg/log-out.svg';

import { DROPDOWN_ICON_SIZE } from './constants';
import styles from './DropdownMenuCommon.module.scss';

import type { JSX } from 'react';

const LogoutButton: React.FC = (): JSX.Element => {
	const handleLogout = async (): Promise<void> => {
		try {
			await signOut({ callbackUrl: '/login' });
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

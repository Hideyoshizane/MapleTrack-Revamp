'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useRouter } from 'next/navigation';

import LogOutIcon from '@assets/svg/log-out.svg';
import { useTheme } from '@context/useTheme';
import { authClient } from '@lib/authClient';

import { DROPDOWN_ICON_SIZE } from './constants';
import styles from './DropdownMenuCommon.module.scss';

import type { JSX } from 'react';

const LogoutButton = (): JSX.Element => {
	const { setTheme } = useTheme();
	const router = useRouter();

	const handleLogout = async (): Promise<void> => {
		try {
			await authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						setTheme('dark');
						router.push('/login');
					},
				},
			});
		} catch (error) {
			console.error('Logout failed:', error);
		}
	};

	return (
		<DropdownMenu.Item className={styles.dropdownItem} aria-label="Logout" onSelect={() => void handleLogout()}>
			<LogOutIcon className={styles.icon} height={DROPDOWN_ICON_SIZE} width={DROPDOWN_ICON_SIZE} />

			<span className={styles.text}>Logout</span>
		</DropdownMenu.Item>
	);
};

export default LogoutButton;

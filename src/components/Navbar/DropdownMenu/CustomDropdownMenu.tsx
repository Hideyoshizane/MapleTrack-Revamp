'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Fragment } from 'react';

import MenuIcon from '@assets/svg/menu.svg';
import ResponsiveText from '@components/ResponsiveText/responsiveText';

import styles from './customDropdownMenu.module.scss';
import DropdownMenuButton from './DropdownMenuButton/dropdownMenuButton';
import LogoutButton from './DropdownMenuButton/logoutButton';

import type { JSX } from 'react';

type CustomDropdownMenuProps = {
	username: string;
};
const MENU_ITEMS = [{ text: 'Classes' }, { text: 'Weekly' }, { text: 'Liberation' }, { text: 'Account' }] as const;

const ICON_SIZE = 48;

const CustomDropdownMenu = ({ username }: CustomDropdownMenuProps): JSX.Element => {
	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<button className={styles.menuOpener} aria-label={`Open menu for ${username}`}>
					<ResponsiveText className={styles.usernameText} height={40} maxFontSize={32} minFontSize={12} width={200}>
						{username}
					</ResponsiveText>
					<MenuIcon className={styles.icon} height={ICON_SIZE} width={ICON_SIZE} />
				</button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content className={styles.dropdownContent} align="end" side="bottom" sideOffset={5}>
					{MENU_ITEMS.map(
						(item): JSX.Element => (
							<Fragment key={item.text}>
								<DropdownMenuButton text={item.text} />
								<DropdownMenu.Separator className={styles.separator} />
							</Fragment>
						),
					)}
					<LogoutButton />
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
};

export default CustomDropdownMenu;

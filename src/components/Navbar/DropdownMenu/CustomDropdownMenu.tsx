'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Fragment } from 'react';
import { Textfit } from 'react-textfit';

import MenuIcon from '@assets/svg/menu.svg';

import styles from './CustomDropdownMenu.module.scss';
import DropdownMenuButton from './DropdownMenuButton/DropdownMenuButton';
import LogoutButton from './DropdownMenuButton/LogoutButton';

import type { JSX } from 'react';

interface CustomDropdownMenuProps {
	username: string;
}
const MENU_ITEMS = [{ text: 'Classes' }, { text: 'Weekly' }, { text: 'Liberation' }, { text: 'Account' }] as const;

const ICON_SIZE = 48;

const CustomDropdownMenu = ({ username }: CustomDropdownMenuProps): JSX.Element => {
	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<button className={styles.menuOpener} aria-label={`Open menu for ${username}`}>
					<Textfit className={styles.usernameText} mode="single" max={32} min={12} style={{ maxWidth: 200 }}>
						{username}
					</Textfit>
					<MenuIcon width={ICON_SIZE} height={ICON_SIZE} className={styles.icon} />
				</button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content className={styles.dropdownContent} side="bottom" align="end" sideOffset={5}>
					{MENU_ITEMS.map(
						(item): JSX.Element => (
							<Fragment key={item.text}>
								<DropdownMenuButton text={item.text} />
								<DropdownMenu.Separator className={styles.separator} />
							</Fragment>
						)
					)}
					<LogoutButton />
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
};

export default CustomDropdownMenu;

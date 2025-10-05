'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import Link from 'next/link';

import ClassIcon from '@assets/svg/id-card.svg';
import SwordsIcon from '@assets/svg/swords.svg';
import TrophyIcon from '@assets/svg/trophy.svg';
import UserIcon from '@assets/svg/user-round.svg';

import { DROPDOWN_ICON_SIZE } from './constants';
import buttonStyles from './DropdownMenuButton.module.scss';
import commonStyles from './DropdownMenuCommon.module.scss';

import type { FunctionComponent, SVGProps, JSX } from 'react';

type SvgIconComponent = FunctionComponent<SVGProps<SVGSVGElement>>;

const MENU_CONFIG = {
	Classes: {
		href: '/home',
		label: 'Class Tracker',
		Icon: ClassIcon as SvgIconComponent,
	},
	Weekly: {
		href: '/weeklyBoss',
		label: 'Weekly Bosses',
		Icon: TrophyIcon as SvgIconComponent,
	},
	Liberation: {
		href: '/liberation',
		label: 'Liberation Quest',
		Icon: SwordsIcon as SvgIconComponent,
	},
	Account: {
		href: '/account',
		label: 'Account Settings',
		Icon: UserIcon as SvgIconComponent,
	},
} as const;

type DropdownMenuKey = keyof typeof MENU_CONFIG;

interface DropdownMenuButtonProps {
	text: DropdownMenuKey;
}

const DropdownMenuButton = ({ text }: DropdownMenuButtonProps): JSX.Element => {
	const { href, label, Icon } = MENU_CONFIG[text];

	return (
		<DropdownMenu.Item asChild className={commonStyles.dropdownItem}>
			<Link href={href} className={buttonStyles.dropdownLink}>
				<Icon width={DROPDOWN_ICON_SIZE} height={DROPDOWN_ICON_SIZE} className={commonStyles.icon} />
				<span className={commonStyles.text}>{label}</span>
			</Link>
		</DropdownMenu.Item>
	);
};

export default DropdownMenuButton;

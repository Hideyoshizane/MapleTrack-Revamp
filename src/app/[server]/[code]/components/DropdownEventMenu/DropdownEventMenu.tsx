'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import React from 'react';

import CheckIcon from '@assets/svg/check.svg';
import ArcaneIcon from '@assets/svg/circle-star.svg';
import SacredIcon from '@assets/svg/hexagon.svg';
import MenuIcon from '@assets/svg/menu.svg';
import { MAX_VALUE_BONUS_COOKIE } from '@constants/cookiesConstants';

import { useBonusContext } from '../../useBonusContext';

import styles from './DropdownEventMenu.module.scss';

import type { JSX } from 'react';

const ICON_SIZE = 40;
const SYMBOL_SIZE = 20;

const DropdownEventMenu = (): JSX.Element => {
	const { arcaneBonus, sacredBonus, setArcaneBonus, setSacredBonus } = useBonusContext();
	const rows = Array.from({ length: MAX_VALUE_BONUS_COOKIE + 1 }, (_, i): number => i);

	const renderBonusItem = (value: number, currentBonus: number, onSelect: (val: number) => void): JSX.Element => (
		<DropdownMenu.Item className={styles.menuItem} key={value} onSelect={(): void => onSelect(value)}>
			<span className={styles.menuText}>{value === 0 ? 'No Bonus' : `Bonus +${value}`}</span>
			{currentBonus === value && <CheckIcon className={styles.checkIcon} height={16} width={16} />}
		</DropdownMenu.Item>
	);

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<button className={styles.menuOpener} type="button">
					Event Bonus
					<MenuIcon className={styles.icon} height={ICON_SIZE} width={ICON_SIZE} />
				</button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content
					className={styles.dropdownContent}
					align="center"
					forceMount
					side="bottom"
					sideOffset={5}
				>
					<div className={styles.gridContainer}>
						<div className={`${styles.header} ${styles.leftColumn}`}>
							<ArcaneIcon height={SYMBOL_SIZE} width={SYMBOL_SIZE} />
							Arcane
						</div>
						<div className={styles.header}>
							<SacredIcon height={SYMBOL_SIZE} width={SYMBOL_SIZE} />
							Sacred
						</div>

						{rows.map(
							(value): JSX.Element => (
								<React.Fragment key={value}>
									<div className={styles.leftColumn}>
										{renderBonusItem(value, arcaneBonus, setArcaneBonus)}
									</div>
									<div>{renderBonusItem(value, sacredBonus, setSacredBonus)}</div>
								</React.Fragment>
							),
						)}
					</div>
					<DropdownMenu.Arrow className={styles.arrow} height={10} width={15} />
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
};

export default DropdownEventMenu;

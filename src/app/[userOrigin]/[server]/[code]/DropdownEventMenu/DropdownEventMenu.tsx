'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import React from 'react';

import CheckIcon from '@assets/svg/check.svg';
import SacredIcon from '@assets/svg/hexagon.svg';
import MenuIcon from '@assets/svg/menu.svg';
import ArcaneIcon from '@assets/svg/star.svg';

import { useBonusContext } from '../BonusContext';

import styles from './DropdownEventMenu.module.css';

const iconSize = 40;
const MAX_BONUS = 10;

const DropdownEventMenu: React.FC = () => {
	const { arcaneBonus, sacredBonus, setArcaneBonus, setSacredBonus } = useBonusContext();
	const rows = Array.from({ length: MAX_BONUS + 1 }, (_, i) => i);

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<button className={styles.menuOpener}>
					Event Bonus
					<MenuIcon width={iconSize} height={iconSize} className={styles.icon} />
				</button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content forceMount className={styles.dropdownContent} side="bottom" align="center" sideOffset={5}>
					<div className={styles.gridContainer}>
						<div className={`${styles.header} ${styles.leftColumn}`}>
							<ArcaneIcon width={16} height={16} />
							Arcane
						</div>
						<div className={styles.header}>
							<SacredIcon width={16} height={16} />
							Sacred
						</div>

						{rows.map((value) => (
							<React.Fragment key={value}>
								{/* Arcane column */}
								<DropdownMenu.Item
									className={`${styles.menuItem} ${styles.leftColumn}`}
									onSelect={() => setArcaneBonus(value)}>
									<span className={styles.menuText}>{value === 0 ? 'No Bonus' : `Bonus +${value}`}</span>
									{arcaneBonus === value && <CheckIcon className={styles.checkIcon} width={16} height={16} />}
								</DropdownMenu.Item>

								{/* Sacred column */}
								<DropdownMenu.Item className={styles.menuItem} onSelect={() => setSacredBonus(value)}>
									<span className={styles.menuText}>{value === 0 ? 'No Bonus' : `Bonus +${value}`}</span>
									{sacredBonus === value && <CheckIcon className={styles.checkIcon} width={16} height={16} />}
								</DropdownMenu.Item>
							</React.Fragment>
						))}
					</div>
					<DropdownMenu.Arrow className={styles.arrow} width={15} height={10} />
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
};

export default DropdownEventMenu;

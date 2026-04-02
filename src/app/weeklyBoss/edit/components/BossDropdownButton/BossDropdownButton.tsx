'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { clsx } from 'clsx';
import { useCallback } from 'react';

import BanIcon from '@assets/svg/ban.svg';
import CheckIcon from '@assets/svg/check.svg';
import Tooltip from '@components/Tooltip/Tooltip';

import styles from './BossDropdownButton.module.scss';

import type { JSX } from 'react';

type Difficulty = {
	minLevel: number;
	name: string;
	reset: string;
	value: number;
};

type BossDropdownButtonProps = {
	selected: boolean;
	value?: number;
	locked?: boolean;
	isSmallButtons: boolean;
	difficulty: Difficulty;
	onSelectDifficulty?: (difficulty: Difficulty, multiplier: number) => void;
};

const DIFFICULTY_CLASS_MAP: Record<string, string> = {
	Easy: styles.easy,
	Normal: styles.normal,
	Hard: styles.hard,
	Chaos: styles.chaos,
	Extreme: styles.extreme,
};

const BossDropdownButton = ({
	locked = false,
	isSmallButtons,
	difficulty,
	value = 0,
	onSelectDifficulty,
}: BossDropdownButtonProps): JSX.Element => {
	const rows = Array.from({ length: 8 }, (_, i): number => i);

	const handleSelect = useCallback(
		(value: number): void => {
			try {
				onSelectDifficulty?.(difficulty, value);
			} catch (error) {
				console.error('Failed to set selected value:', error);
			}
		},
		[difficulty, onSelectDifficulty]
	);

	const renderBossValueItem = (multiplier: number): JSX.Element => (
		<DropdownMenu.Item className={styles.menuItem} key={multiplier} onSelect={(): void => handleSelect(multiplier)}>
			<span className={styles.menuText}>{`${multiplier}x times`}</span>
			{value === multiplier && <CheckIcon className={styles.checkIcon} width={16} height={16} />}
		</DropdownMenu.Item>
	);

	const difficultyClass = DIFFICULTY_CLASS_MAP[difficulty.name] ?? '';
	const sizeClass = isSmallButtons ? styles.smallButton : styles.bigButton;

	const tooltipContent = `Required Level: ${difficulty.minLevel}`;

	// Render locked version
	if (locked) {
		return (
			<Tooltip content={tooltipContent} enabled={true}>
				<button className={clsx(styles.menuOpener, difficultyClass, sizeClass)} disabled>
					<BanIcon width={24} height={24} className={styles.banIcon} />
				</button>
			</Tooltip>
		);
	}

	// Render Dropdown version
	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<button className={clsx(styles.menuOpener, difficultyClass, sizeClass)}>
					{difficulty.name} {value}x
				</button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content forceMount className={styles.dropdownContent} side="bottom" align="center" sideOffset={5}>
					<div className={styles.gridContainer}>{rows.map((value): JSX.Element => renderBossValueItem(value))}</div>

					<DropdownMenu.Arrow className={styles.arrow} width={15} height={10} />
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
};

export default BossDropdownButton;

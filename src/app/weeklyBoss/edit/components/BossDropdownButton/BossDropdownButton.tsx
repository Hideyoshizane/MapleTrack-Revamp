'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { clsx } from 'clsx';

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
	const rows = Array.from({ length: 8 }, (_, index): number => index);

	const handleSelect = (multiplier: number): void => {
		try {
			onSelectDifficulty?.(difficulty, multiplier);
		} catch (error: unknown) {
			console.error('Failed to set selected value:', error);
		}
	};

	const renderBossValueItem = (multiplier: number): JSX.Element => (
		<DropdownMenu.Item className={styles.menuItem} key={multiplier} onSelect={(): void => handleSelect(multiplier)}>
			<span className={styles.menuText}>{`${multiplier}x times`}</span>
			{value === multiplier && <CheckIcon className={styles.checkIcon} height={16} width={16} />}
		</DropdownMenu.Item>
	);

	const difficultyClass = DIFFICULTY_CLASS_MAP[difficulty.name] ?? '';
	const sizeClass = isSmallButtons ? styles.smallButton : styles.bigButton;

	const tooltipContent = `Required Level: ${difficulty.minLevel}`;

	if (locked) {
		return (
			<Tooltip content={tooltipContent} enabled={true}>
				<button className={clsx(styles.menuOpener, difficultyClass, sizeClass)} disabled type="button">
					<BanIcon className={styles.banIcon} height={24} width={24} />
				</button>
			</Tooltip>
		);
	}

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<button className={clsx(styles.menuOpener, difficultyClass, sizeClass)} type="button">
					{difficulty.name} {value}x
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
						{rows.map((multiplier): JSX.Element => renderBossValueItem(multiplier))}
					</div>

					<DropdownMenu.Arrow className={styles.arrow} height={10} width={15} />
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
};

export default BossDropdownButton;

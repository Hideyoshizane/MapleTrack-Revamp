'use client';

import NumberFlow from '@number-flow/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { clsx } from 'clsx';

import CheckIcon from '@assets/svg/check.svg';
import ChevronIcon from '@assets/svg/chevron-down.svg';

import styles from './BossGoldPartySelectComponent.module.scss';

import type { selectedBossesResetAndParty } from '../BossItem';
import type { JSX } from 'react';

type BossGoldPartySelectComponentProps = {
	value: number;
	bossesResetAndType: selectedBossesResetAndParty;
	selectedReset: keyof selectedBossesResetAndParty['partySizes'];
	closing: boolean;
	maxPartySize: number;
	onSelectPartySize: (reset: keyof selectedBossesResetAndParty['partySizes'], partySize: number) => void;
	onClosingAnimationFinish: () => void;
};

const resetTitles: Record<keyof selectedBossesResetAndParty['resets'], string> = {
	Daily: 'Daily',
	Weekly: 'Weekly',
	Monthly: 'Monthly',
};

const BossGoldPartySelectComponent = ({
	value,
	closing,
	bossesResetAndType,
	maxPartySize,
	onSelectPartySize,
	onClosingAnimationFinish,
}: BossGoldPartySelectComponentProps): JSX.Element => {
	const partySizes = Array.from({ length: maxPartySize }, (_, index) => index + 1);

	const partyColumns = (
		Object.keys(bossesResetAndType.resets) as Array<keyof selectedBossesResetAndParty['resets']>
	).filter((reset) => bossesResetAndType.resets[reset]);

	const handlePartySizeSelect = (
		reset: keyof selectedBossesResetAndParty['partySizes'],
		selectedPartySize: number,
	): void => {
		try {
			onSelectPartySize(reset, selectedPartySize);
		} catch (error: unknown) {
			console.error('Failed to select party size:', error);
		}
	};

	const renderPartySizeItem = (
		selectedPartySize: number,
		column: keyof selectedBossesResetAndParty['partySizes'],
	): JSX.Element => (
		<DropdownMenu.Item
			className={styles.menuItem}
			key={`${column}-${selectedPartySize}`}
			onSelect={() => handlePartySizeSelect(column, selectedPartySize)}
		>
			<span className={styles.menuText}>
				{selectedPartySize === 1 ? 'Solo Party' : `${selectedPartySize} Players`}
			</span>

			{bossesResetAndType.partySizes[column] === selectedPartySize && (
				<CheckIcon className={styles.checkIcon} height={16} width={16} />
			)}
		</DropdownMenu.Item>
	);

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<button className={styles.trigger} type="button">
					<NumberFlow
						className={styles.goldText}
						onAnimationsFinish={() => {
							if (closing) {
								onClosingAnimationFinish();
							}
						}}
						transformTiming={{ duration: 200 }}
						value={Math.round(value)}
					/>

					<ChevronIcon className={styles.checkIcon} />
				</button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content
					align="center"
					className={styles.dropdownContent}
					forceMount
					side="bottom"
					sideOffset={5}
				>
					<div className={clsx(styles.gridContainer, styles[`columns${partyColumns.length}`])}>
						{partyColumns.map((column) => (
							<div className={styles.column} key={column}>
								<div className={styles.columnTitle}>{resetTitles[column]}</div>

								{partySizes.map((partySize) => renderPartySizeItem(partySize, column))}
							</div>
						))}
					</div>

					<DropdownMenu.Arrow className={styles.arrow} height={10} width={15} />
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
};

export default BossGoldPartySelectComponent;

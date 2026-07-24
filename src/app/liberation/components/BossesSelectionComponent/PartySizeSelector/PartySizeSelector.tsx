'use client';

import * as Select from '@radix-ui/react-select';

import MenuIcon from '@assets/svg/menu.svg';

import styles from './PartySizeSelector.module.scss';

import type { JSX } from 'react';

type PartySize = {
	label: string;
	multiplier: number;
};

const buildPartySizes = (maxPartySize: number): PartySize[] =>
	Array.from({ length: maxPartySize }, (_, index): PartySize => {
		const multiplier = index + 1;
		return { label: multiplier === 1 ? 'Solo' : `${multiplier}x`, multiplier };
	});

const buildPartySizeMap = (partySizes: PartySize[]): Record<number, PartySize> => {
	const map: Record<number, PartySize> = {};

	for (const entry of partySizes) {
		map[entry.multiplier] = entry;
	}

	return map;
};

type Props = {
	selectedPartySize: number | null;
	onChangePartySize: (partySize: number) => void;
	maxPartySize: number;
};

const DEFAULT_MULTIPLIER = 1;

const PartySizeSelector = ({ selectedPartySize, onChangePartySize, maxPartySize }: Props): JSX.Element => {
	const partySizes = buildPartySizes(maxPartySize);
	const partySizeMap = buildPartySizeMap(partySizes);

	const multiplier = selectedPartySize ?? DEFAULT_MULTIPLIER;
	const selectedEntry = partySizeMap[multiplier] ?? partySizeMap[DEFAULT_MULTIPLIER];

	return (
		<Select.Root
			onValueChange={(value): void => {
				onChangePartySize(Number(value));
			}}
			value={String(multiplier)}
		>
			<Select.Trigger className={styles.selectedBossWrapper}>
				<div className={styles.bossDiv}>
					<p className={styles.partySize}>{selectedEntry.label}</p>
				</div>

				<div className={styles.iconsDiv}>
					<MenuIcon className={styles.menuIcon} />
				</div>
			</Select.Trigger>

			<Select.Portal>
				<Select.Content className={styles.bossList} position="popper">
					<div className={styles.scrollContainer}>
						<Select.Viewport>
							{partySizes.map(
								(entry): JSX.Element => (
									<Select.Item
										className={styles.bossItem}
										key={entry.multiplier}
										value={String(entry.multiplier)}
									>
										<div className={styles.itemContent}>
											<p className={styles.partySize}>{entry.label}</p>
										</div>
									</Select.Item>
								),
							)}
						</Select.Viewport>
					</div>
				</Select.Content>
			</Select.Portal>
		</Select.Root>
	);
};

export default PartySizeSelector;

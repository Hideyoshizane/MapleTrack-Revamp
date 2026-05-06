'use client';

import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Select from '@radix-ui/react-select';

import MenuIcon from '@assets/svg/menu.svg';

import styles from './PartySizeSelector.module.scss';

import type { JSX } from 'react';

type PartySize = {
	label: string;
	multiplier: number;
};

const PARTY_SIZES: PartySize[] = [
	{ label: 'Solo', multiplier: 1 },
	{ label: '2x', multiplier: 2 },
	{ label: '3x', multiplier: 3 },
	{ label: '4x', multiplier: 4 },
	{ label: '5x', multiplier: 5 },
	{ label: '6x', multiplier: 6 },
];

const PARTY_SIZE_MAP: Record<number, PartySize> = (() => {
	const map: Record<number, PartySize> = {};
	for (const entry of PARTY_SIZES) {
		map[entry.multiplier] = entry;
	}
	return map;
})();

const DEFAULT_MULTIPLIER = 1;

type Props = {
	selectedPartySize: number | null;
	onChangePartySize: (partySize: number) => void;
};

const PartySizeSelector = ({ selectedPartySize, onChangePartySize }: Props): JSX.Element => {
	const multiplier = selectedPartySize ?? DEFAULT_MULTIPLIER;
	const selectedEntry = PARTY_SIZE_MAP[multiplier] ?? PARTY_SIZE_MAP[DEFAULT_MULTIPLIER];

	return (
		<Select.Root
			onValueChange={(value): void => {
				onChangePartySize(Number(value));
			}}
			value={String(multiplier)}>
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
					<ScrollArea.Root className={styles.scrollAreaRoot} type="auto">
						<ScrollArea.Viewport className={styles.scrollAreaViewport}>
							<Select.Viewport>
								{PARTY_SIZES.map(
									(entry): JSX.Element => (
										<Select.Item className={styles.bossItem} key={entry.multiplier} value={String(entry.multiplier)}>
											<div className={styles.itemContent}>
												<p className={styles.partySize}>{entry.label}</p>
											</div>
										</Select.Item>
									),
								)}
							</Select.Viewport>
						</ScrollArea.Viewport>

						<ScrollArea.Scrollbar className={styles.scrollAreaScrollbar} orientation="vertical">
							<ScrollArea.Thumb className={styles.scrollAreaThumb} />
						</ScrollArea.Scrollbar>
					</ScrollArea.Root>
				</Select.Content>
			</Select.Portal>
		</Select.Root>
	);
};

export default PartySizeSelector;

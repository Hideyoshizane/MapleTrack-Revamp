'use client';

import NumberFlow from '@number-flow/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import CheckIcon from '@assets/svg/check.svg';

import styles from './BossGoldPartySelectComponent.module.scss';

import type { JSX } from 'react';

type BossGoldPartySelectComponentProps = {
	value: number;
	closing: boolean;
	maxPartySize: number;
	partySize: number;
	onSelectPartySize: (partySize: number) => void;
	onClosingAnimationFinish: () => void;
};

const BossGoldPartySelectComponent = ({
	value,
	closing,
	maxPartySize,
	partySize,
	onSelectPartySize,
	onClosingAnimationFinish,
}: BossGoldPartySelectComponentProps): JSX.Element => {
	const partySizes = Array.from({ length: maxPartySize }, (_, index) => index + 1);

	const handlePartySizeSelect = (selectedPartySize: number): void => {
		try {
			onSelectPartySize(selectedPartySize);
		} catch (error: unknown) {
			console.error('Failed to select party size:', error);
		}
	};

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
						value={Math.round(value / partySize)}
					/>
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
					<div className={styles.gridContainer}>
						{partySizes.map((selectedPartySize) => (
							<DropdownMenu.Item
								className={styles.menuItem}
								key={selectedPartySize}
								onSelect={() => handlePartySizeSelect(selectedPartySize)}
							>
								<span className={styles.menuText}>
									{selectedPartySize === 1 ? 'Solo Party' : `${selectedPartySize} Players`}
								</span>

								{partySize === selectedPartySize && (
									<CheckIcon className={styles.checkIcon} height={16} width={16} />
								)}
							</DropdownMenu.Item>
						))}
					</div>

					<DropdownMenu.Arrow className={styles.arrow} height={10} width={15} />
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
};

export default BossGoldPartySelectComponent;

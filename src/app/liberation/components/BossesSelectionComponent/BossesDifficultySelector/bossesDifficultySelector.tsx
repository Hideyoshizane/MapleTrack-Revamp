'use client';

import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Select from '@radix-ui/react-select';
import { clsx } from 'clsx';

import CheckIcon from '@assets/svg/check.svg';
import MenuIcon from '@assets/svg/menu.svg';

import styles from './bossesDifficultySelector.module.scss';

import type { BossDifficulty } from '@data/liberation/liberationBosses';
import type { JSX } from 'react';

const SKIP_DIFFICULTY: BossDifficulty = {
	name: 'Skip',
	points: 0,
	reset: 'Weekly',
};

type Props = {
	difficulties: BossDifficulty[];
	selectedDifficultyName: string | null;
	onChangeDifficulty: (difficulty: BossDifficulty) => void;
};

const BossesDifficultySelector = ({ difficulties, selectedDifficultyName, onChangeDifficulty }: Props): JSX.Element => {
	const normalizedDifficulties: BossDifficulty[] = difficulties.some(
		(difficulty) => difficulty.name === SKIP_DIFFICULTY.name,
	)
		? difficulties
		: [SKIP_DIFFICULTY, ...difficulties];

	const selectedEntry =
		normalizedDifficulties.find((difficulty) => difficulty.name === selectedDifficultyName) ?? SKIP_DIFFICULTY;

	return (
		<Select.Root
			onValueChange={(value): void => {
				const selected = normalizedDifficulties.find((difficulty) => difficulty.name === value);
				if (selected) {
					onChangeDifficulty(selected);
				}
			}}
			value={selectedEntry.name}>
			<Select.Trigger className={styles.selectedBossWrapper}>
				<div className={styles.bossDiv}>
					<p className={clsx(styles.button, styles[selectedEntry.name.toLowerCase()])}>{selectedEntry.name}</p>
					{selectedEntry.name !== 'Skip' && <p className={styles.points}>{selectedEntry.points} Traces</p>}
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
								{normalizedDifficulties.map(
									(difficulty): JSX.Element => (
										<Select.Item className={styles.bossItem} key={difficulty.name} value={difficulty.name}>
											<div className={styles.itemContent}>
												<p className={clsx(styles.button, styles[difficulty.name.toLowerCase()])}>{difficulty.name}</p>
												{difficulty.name !== 'Skip' && <p className={styles.points}>{difficulty.points} Traces</p>}

												{selectedEntry.name === difficulty.name && (
													<div className={styles.iconsDiv}>
														<CheckIcon className={styles.icon} />
													</div>
												)}
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

export default BossesDifficultySelector;

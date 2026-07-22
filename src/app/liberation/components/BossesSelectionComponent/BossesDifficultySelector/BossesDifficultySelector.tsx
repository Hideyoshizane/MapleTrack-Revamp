'use client';

import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Select from '@radix-ui/react-select';
import { clsx } from 'clsx';
import Image from 'next/image';

import CheckIcon from '@assets/svg/check.svg';
import MenuIcon from '@assets/svg/menu.svg';
import { isAstraDifficulty } from '@data/liberation/liberationBosses';
import { weaponQuestsImagesSrc } from '@data/liberation/liberationQuests';

import styles from './BossesDifficultySelector.module.scss';

import type { BossDifficulty, BossType } from '@data/liberation/liberationBosses';
import type { JSX } from 'react';

const createSkipDifficulty = (sample: BossDifficulty | undefined): BossDifficulty => {
	if (sample && isAstraDifficulty(sample)) {
		return { name: 'Skip', reset: 'Weekly', erion: 0, battle: 0 };
	}

	return { name: 'Skip', reset: 'Weekly', points: 0 };
};

const IMAGE_SIZE = 32;

const DifficultyValue = ({ difficulty, type }: { difficulty: BossDifficulty; type: BossType }): JSX.Element | null => {
	if (difficulty.name === 'Skip') {
		return null;
	}

	if (isAstraDifficulty(difficulty)) {
		return (
			<div className={styles.selectedDifficultyDiv}>
				<div className={styles.selectedDifficultyItem}>
					<Image
						alt={'Currency icon'}
						height={IMAGE_SIZE}
						priority
						src={weaponQuestsImagesSrc['astra_erion']}
						width={IMAGE_SIZE}
					/>
					<p className={styles.points}>{difficulty.erion}</p>
				</div>

				<div className={styles.selectedDifficultyItem}>
					<Image
						alt={'Currency icon'}
						height={IMAGE_SIZE}
						priority
						src={weaponQuestsImagesSrc['astra_battle']}
						width={IMAGE_SIZE}
					/>
					<p className={styles.points}>{difficulty.battle}</p>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.selectedDifficultyDiv}>
			<Image
				alt={'Currency icon'}
				height={IMAGE_SIZE}
				priority
				src={weaponQuestsImagesSrc[type.toLocaleLowerCase()]}
				width={IMAGE_SIZE}
			/>
			<p className={styles.points}>{difficulty.points}</p>
		</div>
	);
};

type Props = {
	difficulties: BossDifficulty[];
	selectedDifficultyName: string | null;
	type: BossType | null;
	onChangeDifficulty: (difficulty: BossDifficulty) => void;
};

const BossesDifficultySelector = ({
	difficulties,
	selectedDifficultyName,
	type,
	onChangeDifficulty,
}: Props): JSX.Element => {
	const skipDifficulty = createSkipDifficulty(difficulties[0]);
	if (type == null) {
		return <div />;
	}

	const normalizedDifficulties: BossDifficulty[] = difficulties.some(
		(difficulty) => difficulty.name === skipDifficulty.name,
	)
		? difficulties
		: [skipDifficulty, ...difficulties];

	const selectedEntry =
		normalizedDifficulties.find((difficulty) => difficulty.name === selectedDifficultyName) ?? skipDifficulty;

	return (
		<Select.Root
			onValueChange={(value): void => {
				const selected = normalizedDifficulties.find((difficulty) => difficulty.name === value);
				if (selected) {
					onChangeDifficulty(selected);
				}
			}}
			value={selectedEntry.name}
		>
			<Select.Trigger className={styles.selectedBossWrapper}>
				<div className={styles.bossDiv}>
					<p className={clsx(styles.button, styles[selectedEntry.name.toLowerCase()])}>
						{selectedEntry.name}
					</p>
					<DifficultyValue difficulty={selectedEntry} type={type} />
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
										<Select.Item
											className={styles.bossItem}
											key={difficulty.name}
											value={difficulty.name}
										>
											<div className={styles.itemContent}>
												<p
													className={clsx(
														styles.button,
														styles[difficulty.name.toLowerCase()],
													)}
												>
													{difficulty.name}
												</p>
												<DifficultyValue difficulty={difficulty} type={type} />

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

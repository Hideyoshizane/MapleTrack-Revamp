'use client';

import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Select from '@radix-ui/react-select';
import Image from 'next/image';

import CheckIcon from '@assets/svg/check.svg';
import MenuIcon from '@assets/svg/menu.svg';

import styles from './QuestDropdown.module.scss';

import type { LiberationQuest, AstraQuest } from '@data/liberation/liberationQuests';
import type { JSX } from 'react';

type Props = {
	quest: LiberationQuest | AstraQuest;
	selectedQuest: string | null;
	onSelectBoss: (bossName: string) => void;
	type: string;
};

const IMAGE_SIZE = 56;

const QuestDropdown = ({ type, quest, selectedQuest, onSelectBoss }: Props): JSX.Element => {
	const bosses = Object.entries(quest.bosses) as Array<
		[key: string, value: (typeof quest.bosses)[keyof typeof quest.bosses]]
	>;

	const defaultBossByType = type === 'Genesis' ? 'Von Leon' : 'Seren';

	const bossExists = (bossName: string | null): bossName is string => {
		return bossName !== null && bossName in quest.bosses;
	};

	const safeSelectedQuest = bossExists(selectedQuest) ? selectedQuest : defaultBossByType;
	const selectedEntry = safeSelectedQuest ? quest.bosses[safeSelectedQuest] : null;

	return (
		<Select.Root
			onValueChange={(value): void => {
				if (value !== selectedQuest) {
					onSelectBoss(value);
				}
			}}
			value={safeSelectedQuest ?? undefined}
		>
			<Select.Trigger className={styles.selectedBossWrapper}>
				{selectedEntry && safeSelectedQuest && (
					<>
						<div className={styles.bossDiv}>
							<Image
								alt={safeSelectedQuest}
								height={IMAGE_SIZE}
								priority
								src={selectedEntry.img}
								width={IMAGE_SIZE}
							/>
							<p className={styles.bossName}>{safeSelectedQuest}</p>
						</div>

						<div className={styles.iconsDiv}>
							<MenuIcon className={styles.menuIcon} />
						</div>
					</>
				)}
			</Select.Trigger>

			<Select.Portal>
				<Select.Content className={styles.bossList} position="popper">
					<ScrollArea.Root className={styles.scrollAreaRoot} type="auto">
						<ScrollArea.Viewport className={styles.scrollAreaViewport}>
							<Select.Viewport>
								{bosses.map(([bossName, bossData]) => (
									<Select.Item className={styles.bossItem} key={bossName} value={bossName}>
										<div className={styles.itemContent}>
											<Image
												alt={bossName}
												height={IMAGE_SIZE}
												src={bossData.img}
												width={IMAGE_SIZE}
											/>
											<p>{bossName}</p>
											{safeSelectedQuest === bossName && (
												<div className={styles.iconsDiv}>
													<CheckIcon className={styles.icon} />
												</div>
											)}
										</div>
									</Select.Item>
								))}
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

export default QuestDropdown;

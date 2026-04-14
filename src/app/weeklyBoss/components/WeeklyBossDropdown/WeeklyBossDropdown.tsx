'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import Image from 'next/image';
import { Fragment } from 'react';
import { toast } from 'react-toastify';

import BossCheckedIcon from '@assets/svg/check-boss.svg';
import NoBossIcon from '@assets/svg/circle-x.svg';
import MenuIcon from '@assets/svg/menu.svg';
import { generateClassCode } from '@data/classes/classes';

import CharacterBossItem from './BossItem/characterBossItem';
import styles from './weeklyBossDropdown.module.scss';

import type { getBossListCharacterResponseBody } from '@features/Boss/schemas/bossList.response.schema';
import type { JSX } from 'react';

type HandleBossToggle = (bossMosterId: string) => void | Promise<void>;

type WeeklyBossDropdownProps = {
	character: getBossListCharacterResponseBody;
	server: string;
	handleBossToggle: HandleBossToggle;
};

const WeeklyBossDropdown = ({ character, server, handleBossToggle }: WeeklyBossDropdownProps): JSX.Element => {
	const totalBosses = character.bosses.filter((boss) => !boss.locked).length;
	const isDisabled = totalBosses === 0;
	const clearedBosses = character.bosses.filter((boss) => boss.cleared).length;
	const isCleared = clearedBosses === totalBosses;
	const code = generateClassCode(character.class);

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild disabled={isDisabled}>
				<div
					className={styles.selectedCharacterWrapper}
					data-disabled={isDisabled}
					data-cleared={isCleared && !isDisabled}
					role="button"
					aria-label={`Selected character: ${character.name}`}>
					<div className={styles.nameDiv}>
						<p className={styles.characterName}>{character.name}</p>
						<p className={styles.characterClass}>{character.class}</p>
					</div>

					<div className={styles.iconsDiv}>
						{isDisabled ? (
							<div />
						) : isCleared ? (
							<BossCheckedIcon className={styles.iconClear} />
						) : (
							<p className={styles.bossNumber}>
								{clearedBosses}/{totalBosses}
							</p>
						)}
						{isDisabled ? <NoBossIcon className={styles.iconClear} /> : <MenuIcon className={styles.icon} />}
					</div>

					<Image
						className={styles.classIcon}
						src={`/assets/buttom_profile/${code}.webp`}
						alt={character.name}
						width={480}
						height={80}
						priority
					/>
				</div>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content className={styles.characterList} sideOffset={4} align="start" side="bottom">
					<ScrollArea.Root className={styles.scrollAreaRoot}>
						<ScrollArea.Viewport className={styles.scrollAreaViewport}>
							{character.bosses.map((boss) => (
								<Fragment key={`${boss.name}-${boss.difficulty}`}>
									<DropdownMenu.CheckboxItem
										checked={boss.cleared}
										data-checked={boss.cleared}
										data-locked={boss.locked}
										onSelect={(event): void => {
											event.preventDefault();
										}}
										className={styles.characterItem}>
										<CharacterBossItem
											boss={boss}
											server={server}
											isSelected={boss.locked || boss.cleared}
											onClick={() => {
												if (boss.locked) {
													toast.info('This boss has already been cleared this month.');
													return;
												}
												const bossMonsterId = boss.id;
												void handleBossToggle(bossMonsterId);
											}}
										/>
									</DropdownMenu.CheckboxItem>
								</Fragment>
							))}
						</ScrollArea.Viewport>

						<ScrollArea.Scrollbar className={styles.scrollAreaScrollbar} orientation="vertical">
							<ScrollArea.Thumb className={styles.scrollAreaThumb} />
						</ScrollArea.Scrollbar>
					</ScrollArea.Root>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
};

export default WeeklyBossDropdown;

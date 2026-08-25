'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import Image from 'next/image';
import { Fragment } from 'react';
import { toast } from 'react-toastify';

import BossCheckedIcon from '@assets/svg/check-boss.svg';
import NoBossIcon from '@assets/svg/circle-x.svg';
import MenuIcon from '@assets/svg/menu.svg';
import { compareBossOrder } from '@data/bosses/bosses';
import { generateClassCode } from '@data/classes/classes';

import CharacterBossItem from './BossItem/CharacterBossItem';
import styles from './WeeklyBossDropdown.module.scss';

import type { getBossListCharacterResponseBody } from '@features/boss/schemas/bossList.response.schema';
import type { JSX } from 'react';

type HandleBossToggle = (bossMosterId: string) => void | Promise<void>;

type Props = {
	character: getBossListCharacterResponseBody;
	server: string;
	handleBossToggle: HandleBossToggle;
};

const WeeklyBossDropdown = ({ character, server, handleBossToggle }: Props): JSX.Element => {
	const totalBosses = character.bosses.length;
	const isDisabled = totalBosses === 0;

	const completedBosses = character.bosses.filter((boss) => boss.cleared || boss.locked).length;
	const isCleared = completedBosses === totalBosses;

	const code = generateClassCode(character.class);
	const sortedBosses = [...character.bosses].sort(compareBossOrder);

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild disabled={isDisabled}>
				<div
					className={styles.selectedCharacterWrapper}
					aria-label={`Selected character: ${character.name}`}
					data-cleared={isCleared && !isDisabled}
					data-disabled={isDisabled}
					role="button"
				>
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
								{completedBosses}/{totalBosses}
							</p>
						)}
						{isDisabled ? (
							<NoBossIcon className={styles.iconClear} />
						) : (
							<MenuIcon className={styles.icon} />
						)}
					</div>

					<Image
						className={styles.classIcon}
						alt={character.name}
						height={80}
						priority
						src={`/assets/buttom_profile/${code}.webp`}
						width={480}
					/>
				</div>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content className={styles.characterList} align="start" side="bottom" sideOffset={4}>
					<div className={styles.scrollContainer}>
						{sortedBosses.map((boss) => (
							<Fragment key={`${boss.name}-${boss.difficulty}`}>
								<DropdownMenu.CheckboxItem
									className={styles.characterItem}
									checked={boss.cleared}
									data-checked={boss.cleared}
									data-locked={boss.locked}
									onSelect={(event): void => {
										event.preventDefault();
									}}
								>
									<CharacterBossItem
										boss={boss}
										isSelected={boss.locked || boss.cleared}
										onClick={() => {
											if (boss.locked) {
												const message =
													boss.reset === 'Monthly'
														? 'This boss has already been cleared this month.'
														: boss.reset === 'Daily'
															? 'All daily clears completed for this week.'
															: null;

												if (message) {
													toast.info(message);
													return;
												}
											}

											void handleBossToggle(boss.id);
										}}
										server={server}
									/>
								</DropdownMenu.CheckboxItem>
							</Fragment>
						))}
					</div>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
};

export default WeeklyBossDropdown;

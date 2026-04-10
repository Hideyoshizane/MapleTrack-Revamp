'use client';

import NumberFlow from '@number-flow/react';
import { clsx } from 'clsx';
import Image from 'next/image';
import { useRef, useEffect, useState, Fragment } from 'react';

import BossCheckedIcon from '@assets/svg/check-boss.svg';
import ChevronIcon from '@assets/svg/chevron-down.svg';
import NoBossIcon from '@assets/svg/circle-x.svg';
import { SkeletonWrapper } from '@components/SkeletonWrapper/skeletonWrapper';
import { generateClassCode } from '@data/classes/classes';

import CharacterBossItem from './BossItem/characterBossItem';
import styles from './weeklyBossDropdown.module.scss';

import type { getBossListCharacterResponseBody } from '@features/Boss/schemas/bossList.response.schema';
import type { JSX } from 'react';

type WeeklyBossDropdownProps = {
	character: getBossListCharacterResponseBody;
	server: string;
};

const WeeklyBossDropdown = ({ character, server }: WeeklyBossDropdownProps): JSX.Element => {
	const [isOpen, setIsOpen] = useState(false);

	const [isAnimating, setIsAnimating] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Toggle dropdown open/close state
	const handleToggle = (): void => {
		if ((character && !character.bosses) || (character && character.bosses.length === 0)) {
			return;
		}

		if (!isOpen) {
			setIsAnimating(true);
		}
		setIsOpen((prev) => !prev);
	};

	// Close dropdown when clicking outside
	useEffect((): (() => void) => {
		const handleClickOutside = (event: MouseEvent): void => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return (): void => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	useEffect(() => {
		if (!isOpen && isAnimating) {
			const timer = setTimeout(() => setIsAnimating(false), 300);
			return (): void => clearTimeout(timer);
		}
	}, [isOpen, isAnimating]);

	// Skeleton placeholder while selectedServer is not ready
	if (!character) {
		return <SkeletonWrapper width={502} height={368} color="light" variant="rounded" />;
	}

	const totalBosses = character.bosses.length;
	const clearedBosses = character.bosses.filter((boss) => boss.cleared).length;
	const isCleared = clearedBosses === totalBosses;
	const code = generateClassCode(character.class);

	return (
		<div className={styles.outerWrap}>
			<div
				ref={dropdownRef}
				className={clsx(styles.characterDropdownWrapper, {
					[styles.open]: isOpen,
					[styles.stayOnTop]: isAnimating,
					[styles.cleared]: isCleared,
					[styles.disabled]: totalBosses === 0,
				})}>
				<div
					className={styles.selectedCharacterWrapper}
					onClick={handleToggle}
					tabIndex={0}
					role="button"
					aria-expanded={isOpen}
					aria-label={`Selected character: ${character.name}`}
					onKeyDown={(e): void => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							handleToggle();
						}
					}}>
					<div className={styles.nameDiv}>
						<p className={styles.characterName}>{character.name}</p>
						<p className={styles.characterClass}>{character.class}</p>
					</div>
					<div className={styles.iconsDiv}>
						{totalBosses === 0 ? (
							<NoBossIcon className={styles.iconClear} />
						) : isCleared ? (
							<BossCheckedIcon className={styles.iconClear} />
						) : (
							<p className={styles.bossNumber}>
								<NumberFlow value={clearedBosses} />
								{`/${totalBosses}`}
							</p>
						)}
						<ChevronIcon className={clsx(styles.icon, styles.rotated, { [styles.rotatedActive]: isOpen })} />
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
				<hr className={styles.hr} />
				<div className={styles.characterList}>
					{character.bosses.map((boss, index) => (
						<Fragment key={`${boss.name}-${boss.difficulty}`}>
							<CharacterBossItem
								boss={boss}
								server={server}
								isSelected={false}
								onClick={(): void => {
									// define behavior if selecting a boss is needed
								}}
							/>
							{index < character.bosses.length - 1 && <hr className={styles.hr} />}
						</Fragment>
					))}
				</div>
			</div>
		</div>
	);
};

export default WeeklyBossDropdown;

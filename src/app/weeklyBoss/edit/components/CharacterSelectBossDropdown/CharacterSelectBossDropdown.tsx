'use client';

import { codeToClass } from '@features/character/characterAttributes';
import { clsx } from 'clsx';
import Image from 'next/image';
import { useRef, useEffect, useState, Fragment } from 'react';

import ChevronIcon from '@assets/svg/chevron-down.svg';
import { SkeletonWrapper } from '@components/SkeletonWrapper/SkeletonWrapper';

import CharacterBossItem from './BossItem/CharacterBossItem';
import styles from './CharacterSelectBossDropdown.module.scss';

import type { BossCharacterDraft as BossCharacter } from '@features/Boss/bossListModel';
import type { JSX } from 'react';

type CharacterSelectBossDropdownProps = {
	setSelectedCharacter: (value: BossCharacter) => void;
	selectedCharacter: BossCharacter | null;
	characters: BossCharacter[];
};

const CharacterSelectBossDropdown = ({
	setSelectedCharacter,
	selectedCharacter,
	characters,
}: CharacterSelectBossDropdownProps): JSX.Element => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Toggle dropdown open/close state
	const handleToggle = (): void => setIsOpen((prev) => !prev);

	const handleSelectCharacter = (character: BossCharacter): void => {
		setSelectedCharacter(character);
		setIsOpen(false);
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

	// Skeleton placeholder while selectedServer is not ready
	if (!selectedCharacter) {
		return <SkeletonWrapper width={502} height={368} color="light" variant="rounded" />;
	}

	return (
		<div ref={dropdownRef} className={clsx(styles.characterDropdownWrapper, { [styles.open]: isOpen })}>
			{/* Selected character button */}
			<div
				className={styles.selectedCharacterWrapper}
				onClick={handleToggle}
				tabIndex={0}
				role="button"
				aria-expanded={isOpen}
				aria-label={`Selected character: ${selectedCharacter.name}`}
				onKeyDown={(e): void => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						handleToggle();
					}
				}}>
				<div className={styles.nameDiv}>
					<p className={styles.characterName}>{selectedCharacter.name}</p>
					<p className={styles.characterClass}>{codeToClass(selectedCharacter.code)}</p>
				</div>
				<div className={styles.iconsDiv}>
					<ChevronIcon className={clsx(styles.chevronIcon, styles.rotated, { [styles.rotatedActive]: isOpen })} />
				</div>
				<Image
					className={styles.classIcon}
					src={`/assets/buttom_profile/${selectedCharacter.code}.webp`}
					alt={selectedCharacter.name}
					width={480}
					height={80}
					priority
				/>
			</div>
			<hr className={styles.hr} />
			{/* Dropdown list */}
			<div className={styles.characterList}>
				{characters.map((character, index) => (
					<Fragment key={character.code}>
						<CharacterBossItem
							character={character}
							isSelected={character.code === selectedCharacter.code}
							onClick={() => handleSelectCharacter(character)}
						/>
						{index < characters.length - 1 && <hr className={styles.hr} />}
					</Fragment>
				))}
			</div>
		</div>
	);
};

export default CharacterSelectBossDropdown;

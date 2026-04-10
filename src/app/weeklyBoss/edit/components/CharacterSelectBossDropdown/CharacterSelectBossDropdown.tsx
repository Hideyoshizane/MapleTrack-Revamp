'use client';
import { clsx } from 'clsx';
import Image from 'next/image';
import { useRef, useEffect, useState, Fragment } from 'react';

import ChevronIcon from '@assets/svg/chevron-down.svg';
import { SkeletonWrapper } from '@components/SkeletonWrapper/skeletonWrapper';
import { generateClassCode } from '@data/classes/classes';

import CharacterBossItem from './BossItem/characterBossItem';
import styles from './characterSelectBossDropdown.module.scss';

import type { getEditBossListCharacterResponseBody } from '@features/Boss/schemas/bossList.response.schema';
import type { JSX } from 'react';

type CharacterSelectBossDropdownProps = {
	setSelectedCharacter: (value: getEditBossListCharacterResponseBody) => void;
	selectedCharacter: getEditBossListCharacterResponseBody | null;
	characters: getEditBossListCharacterResponseBody[];
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

	const handleSelectCharacter = (character: getEditBossListCharacterResponseBody): void => {
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

	const code = generateClassCode(selectedCharacter.class);

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
					<p className={styles.characterClass}>{selectedCharacter.class}</p>
				</div>
				<div className={styles.iconsDiv}>
					<ChevronIcon className={clsx(styles.chevronIcon, styles.rotated, { [styles.rotatedActive]: isOpen })} />
				</div>
				<Image
					className={styles.classIcon}
					src={`/assets/buttom_profile/${code}.webp`}
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
					<Fragment key={character.class}>
						<CharacterBossItem
							character={character}
							isSelected={character.class === selectedCharacter.class}
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

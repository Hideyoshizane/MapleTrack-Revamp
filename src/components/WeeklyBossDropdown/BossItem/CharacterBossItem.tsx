// src/components/ServerDropdown/ServerItem.tsx
'use client';

import Image from 'next/image';

import { codeToClass } from '@/utils/character/codeToClass';
import CheckIcon from '@assets/svg/check.svg';

import styles from './CharacterBossItem.module.scss';

import type { BossCharacter } from '@/models/bossList';
import type { JSX, KeyboardEvent } from 'react';

interface CharacterBossItemProps {
	character: BossCharacter;
	isSelected: boolean;
	onClick?: () => void;
}

export default function CharacterBossItem({ character, isSelected, onClick }: CharacterBossItemProps): JSX.Element {
	const handleKey = (event: KeyboardEvent<HTMLDivElement>): void => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onClick?.();
		}
	};

	return (
		<div
			className={styles.wrapper}
			tabIndex={0}
			role="option"
			aria-selected={isSelected}
			onKeyDown={handleKey}
			onClick={onClick}>
			<Image
				className={styles.classIcon}
				src={`/assets/buttom_profile/${character.code}.webp`}
				alt={character.name}
				width={480}
				height={80}
				priority
			/>
			<div className={styles.nameDiv}>
				<p className={styles.characterName}>{character.name}</p>
				<p className={styles.characterClass}>{codeToClass(character.code)}</p>
			</div>
			{isSelected && (
				<div className={styles.iconsDiv}>
					<CheckIcon className={styles.icon} />
				</div>
			)}
		</div>
	);
}

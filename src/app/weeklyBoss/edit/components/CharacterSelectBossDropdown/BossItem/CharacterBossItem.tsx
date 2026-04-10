'use client';

import Image from 'next/image';

import CheckIcon from '@assets/svg/check.svg';
import { generateClassCode } from '@data/classes/classes';

import styles from './characterBossItem.module.scss';

import type { getEditBossListCharacterResponseBody } from '@features/Boss/schemas/bossList.response.schema';
import type { JSX, KeyboardEvent } from 'react';

type CharacterBossItemProps = {
	character: getEditBossListCharacterResponseBody;
	isSelected: boolean;
	onClick?: () => void;
};

export default function CharacterBossItem({ character, isSelected, onClick }: CharacterBossItemProps): JSX.Element {
	const handleKey = (event: KeyboardEvent<HTMLDivElement>): void => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onClick?.();
		}
	};

	const code = generateClassCode(character.class);

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
				src={`/assets/buttom_profile/${code}.webp`}
				alt={character.name}
				width={480}
				height={80}
				priority
			/>
			<div className={styles.nameDiv}>
				<p className={styles.characterName}>{character.name}</p>
				<p className={styles.characterClass}>{character.class}</p>
			</div>
			{isSelected && (
				<div className={styles.iconsDiv}>
					<CheckIcon className={styles.icon} />
				</div>
			)}
		</div>
	);
}

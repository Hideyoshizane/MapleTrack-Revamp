'use client';

import Image from 'next/image';

import CheckIcon from '@assets/svg/check.svg';
import { generateClassCode } from '@data/classes/classes';

import styles from './CharacterBossItem.module.scss';

import type { getEditBossListCharacterResponseBody } from '@features/boss/schemas/bossList.response.schema';
import type { JSX, KeyboardEvent } from 'react';

type Props = {
	character: getEditBossListCharacterResponseBody;
	isSelected: boolean;
	onClick?: () => void;
};

const CharacterBossItem = ({ character, isSelected, onClick }: Props): JSX.Element => {
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
			aria-selected={isSelected}
			onClick={onClick}
			onKeyDown={handleKey}
			role="option"
			tabIndex={0}>
			<Image
				className={styles.classIcon}
				alt={character.name}
				height={80}
				priority
				src={`/assets/buttom_profile/${code}.webp`}
				width={480}
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
};

export default CharacterBossItem;

'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';

import Button from '@components/Button/Button';
import { SkeletonWrapper } from '@components/SkeletonWrapper/SkeletonWrapper';

import DropdownEventMenu from '../DropdownEventMenu/DropdownEventMenu';

import styles from './CharacterHeader.module.scss';

import type { CharacterDataFromAPI } from '@features/character/characterApi';
import type { CharacterDraft as Character } from '@features/character/characterModel';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { JSX } from 'react';

type CharacterHeaderProps = {
	character: Character;
	extraData: CharacterDataFromAPI | null;
	router: AppRouterInstance;
	onIncreaseAll: () => void;
	setDisableAllDaily: (value: boolean) => void;
};

const CharacterHeader = ({
	character,
	extraData,
	router,
	onIncreaseAll,
	setDisableAllDaily,
}: CharacterHeaderProps): JSX.Element => {
	const pathname = usePathname();
	const characterImage = character.syncing ? (
		extraData ? (
			<Image
				src={extraData.characterImgURL}
				alt="Fetched from API"
				width={80}
				height={80}
				className={styles.loadedImage}
			/>
		) : (
			<SkeletonWrapper width={80} height={80} color="light" variant="rectangular" />
		)
	) : null;

	return (
		<>
			<div className={styles.buttonLine}>
				<DropdownEventMenu />
				<Button
					className={styles.increaseAllButton}
					onClick={(): void => {
						setDisableAllDaily(true);
						onIncreaseAll();
					}}>
					Increase All
				</Button>
				<Button className={styles.editCharacterButton} onClick={(): void => router.push(`${pathname}/edit`)}>
					Edit Character
				</Button>
			</div>

			<div className={styles.usernameLine}>
				<div className={styles.characterImgDiv}>{characterImage}</div>
				<p className={styles.characterName}>{character.name}</p>
			</div>
		</>
	);
};

export default CharacterHeader;

'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';

import Button from '@components/Button/button';
import { SkeletonWrapper } from '@components/SkeletonWrapper/skeletonWrapper';

import DropdownEventMenu from '../DropdownEventMenu/dropdownEventMenu';

import styles from './characterHeader.module.scss';

import type {
	getCharacterDataFromAPIResponseBody,
	getCharacterDataResponseBody,
} from '@features/character/schemas/character.response.schema';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { JSX } from 'react';

type CharacterHeaderProps = {
	character: getCharacterDataResponseBody;
	extraData: getCharacterDataFromAPIResponseBody | null;
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

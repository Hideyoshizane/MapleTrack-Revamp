'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';

import Button from '@components/Button/Button';
import { SkeletonWrapper } from '@components/SkeletonWrapper/SkeletonWrapper';

import DropdownEventMenu from '../DropdownEventMenu/DropdownEventMenu';

import styles from './CharacterHeader.module.scss';

import type {
	getCharacterDataFromAPIResponseBody,
	getCharacterDataResponseBody,
} from '@features/character/schemas/character.response.schema';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { JSX } from 'react';

type Props = {
	character: getCharacterDataResponseBody;
	extraData: getCharacterDataFromAPIResponseBody | null;
	router: AppRouterInstance;
	onIncreaseAll: () => void;
};

const CharacterHeader = ({ character, extraData, router, onIncreaseAll }: Props): JSX.Element => {
	const pathname = usePathname();
	const characterImage = character.syncing ? (
		extraData ? (
			<Image
				className={styles.loadedImage}
				alt="Fetched from API"
				height={80}
				src={extraData.characterImgURL}
				width={80}
			/>
		) : (
			<SkeletonWrapper color="light" height={80} variant="rectangular" width={80} />
		)
	) : null;

	return (
		<>
			<div className={styles.buttonLine}>
				<DropdownEventMenu />
				<Button
					className={styles.increaseAllButton}
					onClick={(): void => {
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

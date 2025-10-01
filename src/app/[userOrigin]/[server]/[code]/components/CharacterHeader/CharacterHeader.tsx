'use client';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import Button from '@components/Button/Button';
import { SkeletonWrapper } from '@components/SkeletonWrapper/SkeletonWrapper';

import DropdownEventMenu from '../DropdownEventMenu/DropdownEventMenu';

import styles from './CharacterHeader.module.scss';

import type { CharacterDocument } from '@models/character';
import type { ExtraCharacterData } from '@sharedTypes/character';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { JSX } from 'react';

interface CharacterHeaderProps {
	character: CharacterDocument;
	extraData: ExtraCharacterData | null;
	router: AppRouterInstance;
}

const CharacterHeader = ({ character, extraData, router }: CharacterHeaderProps): JSX.Element => {
	const pathname = usePathname();
	return (
		<>
			<div className={styles.buttonLine}>
				<DropdownEventMenu />
				<Button className={styles.increaseAllButton}>Increase All</Button>
				<Button className={styles.editCharacterButton} onClick={(): void => router.push(`${pathname}/edit`)}>
					Edit Character
				</Button>
			</div>

			<div className={styles.usernameLine}>
				<div className={styles.characterImgDiv}>
					{character.syncing &&
						(extraData ? (
							<Image
								src={extraData.characterImgURL}
								alt="Fetched from API"
								width={80}
								height={80}
								className={styles.loadedImage}
							/>
						) : (
							<SkeletonWrapper width={80} height={80} color="light" variant="rectangular" />
						))}
				</div>
				<p className={styles.characterName}>{character.name}</p>
			</div>
		</>
	);
};

export default CharacterHeader;

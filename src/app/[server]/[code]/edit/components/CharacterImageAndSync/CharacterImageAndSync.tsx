'use client';
import Image from 'next/image';

import ErrorIcon from '@assets/svg/circle-x.svg';
import { SkeletonWrapper } from '@components/SkeletonWrapper/SkeletonWrapper';
import Switch from '@components/Switch/Switch';
import Tooltip from '@components/Tooltip/Tooltip';

import styles from './CharacterImageAndSync.module.scss';

import type { CharacterDataFromAPI } from '@features/character/characterApi';
import type { CharacterDraft as Character } from '@features/character/characterModel';
import type { JSX } from 'react';

type Props = {
	character?: Character;
	CharacterDataFromAPI: CharacterDataFromAPI | null;
	CharacterDataFromAPIFailed: boolean;
	syncEnabled: boolean;
	toggleSync: () => void;
	CHARACTER_IMG_SIZE?: number;
};

export const CharacterImageAndSync = ({
	character,
	CharacterDataFromAPI,
	CharacterDataFromAPIFailed,
	syncEnabled,
	toggleSync,
	CHARACTER_IMG_SIZE = 80,
}: Props): JSX.Element => {
	const syncing = character?.syncing ?? false;

	const handleToggle = (): void => {
		if (!character) {
			return;
		}
		toggleSync();
	};

	const characterImage = (): JSX.Element => {
		if (!syncEnabled) {
			return <div />;
		}
		if (CharacterDataFromAPI?.characterImgURL) {
			return (
				<Image
					src={CharacterDataFromAPI.characterImgURL}
					width={CHARACTER_IMG_SIZE}
					height={CHARACTER_IMG_SIZE}
					alt="Fetched from API"
					className={styles.loadedImage}
					quality={100}
				/>
			);
		}
		if (CharacterDataFromAPIFailed) {
			return (
				<Tooltip content="Character not found." placement="top">
					<ErrorIcon width={CHARACTER_IMG_SIZE} height={CHARACTER_IMG_SIZE} className={styles.errorIcon} />
				</Tooltip>
			);
		}
		return (
			<SkeletonWrapper width={CHARACTER_IMG_SIZE} height={CHARACTER_IMG_SIZE} color="light" variant="rectangular" />
		);
	};

	return (
		<div className={styles.characterImgSwitch}>
			<div className={styles.characterImgDiv}>{characterImage()}</div>
			<Switch
				title="Sync Character"
				checked={syncing}
				tooltipMessage="Automatically update level from MapleStory API."
				onCheckedChange={handleToggle}
			/>
		</div>
	);
};

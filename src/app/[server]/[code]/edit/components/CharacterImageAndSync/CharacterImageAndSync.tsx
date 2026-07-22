'use client';
import Image from 'next/image';

import ErrorIcon from '@assets/svg/circle-x.svg';
import { SkeletonWrapper } from '@components/SkeletonWrapper/SkeletonWrapper';
import Switch from '@components/Switch/Switch';
import Tooltip from '@components/Tooltip/Tooltip';

import styles from './CharacterImageAndSync.module.scss';

import type {
	getCharacterDataFromAPIResponseBody,
	getEditCharacterDataResponseBody,
} from '@features/character/schemas/character.response.schema';
import type { JSX } from 'react';

type Props = {
	character?: getEditCharacterDataResponseBody;
	CharacterDataFromAPI: getCharacterDataFromAPIResponseBody | null;
	CharacterDataFromAPIFailed: boolean;
	syncEnabled: boolean;
	toggleSyncAction: () => void;
	CHARACTER_IMG_SIZE?: number;
};

export const CharacterImageAndSync = ({
	character,
	CharacterDataFromAPI,
	CharacterDataFromAPIFailed,
	syncEnabled,
	toggleSyncAction,
	CHARACTER_IMG_SIZE = 80,
}: Props): JSX.Element => {
	const syncing = character?.syncing ?? false;

	const handleToggle = (): void => {
		if (!character) {
			return;
		}
		toggleSyncAction();
	};

	const characterImage = (): JSX.Element => {
		if (!syncEnabled) {
			return <div />;
		}
		if (CharacterDataFromAPI?.characterImgURL) {
			return (
				<Image
					className={styles.loadedImage}
					alt="Fetched from API"
					height={CHARACTER_IMG_SIZE}
					quality={100}
					src={CharacterDataFromAPI.characterImgURL}
					width={CHARACTER_IMG_SIZE}
				/>
			);
		}
		if (CharacterDataFromAPIFailed) {
			return (
				<Tooltip content="Character not found." placement="top">
					<ErrorIcon className={styles.errorIcon} height={CHARACTER_IMG_SIZE} width={CHARACTER_IMG_SIZE} />
				</Tooltip>
			);
		}
		return (
			<SkeletonWrapper
				color="light"
				height={CHARACTER_IMG_SIZE}
				variant="rectangular"
				width={CHARACTER_IMG_SIZE}
			/>
		);
	};

	return (
		<div className={styles.characterImgSwitch}>
			<div className={styles.characterImgDiv}>{characterImage()}</div>
			<Switch
				checked={syncing}
				onCheckedChange={handleToggle}
				title="Sync Character"
				tooltipMessage="Automatically update level from MapleStory API. (Updates at around 1PM UTC)."
			/>
		</div>
	);
};

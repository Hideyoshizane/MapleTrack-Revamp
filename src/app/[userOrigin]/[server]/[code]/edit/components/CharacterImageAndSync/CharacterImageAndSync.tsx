'use client';
import Image from 'next/image';

import ErrorIcon from '@assets/svg/circle-x.svg';
import { SkeletonWrapper } from '@components/SkeletonWrapper/SkeletonWrapper';
import Switch from '@components/Switch/Switch';
import Tooltip from '@components/Tooltip/Tooltip';

import styles from './CharacterImageAndSync.module.scss';

import type { ExtraCharacterData, Character } from '@/shared/types/character';
import type { JSX } from 'react';

interface Props {
	character?: Character;
	extraData: ExtraCharacterData | null;
	extraDataFailed: boolean;
	onSyncToggle: () => void;
	CHARACTER_IMG_SIZE?: number;
}

export const CharacterImageAndSync = ({
	character,
	extraData,
	extraDataFailed,
	onSyncToggle,
	CHARACTER_IMG_SIZE = 80,
}: Props): JSX.Element => {
	const syncing = character?.syncing ?? false;

	const handleToggle = (): void => {
		if (!character) return;
		onSyncToggle();
	};

	const characterImage = (): JSX.Element => {
		if (!syncing) return <></>;
		if (extraData?.characterImgURL)
			return (
				<Image
					src={extraData.characterImgURL}
					width={CHARACTER_IMG_SIZE}
					height={CHARACTER_IMG_SIZE}
					alt="Fetched from API"
					className={styles.loadedImage}
				/>
			);
		if (extraDataFailed)
			return (
				<Tooltip content="Character not found." placement="top">
					<ErrorIcon width={CHARACTER_IMG_SIZE} height={CHARACTER_IMG_SIZE} className={styles.errorIcon} />
				</Tooltip>
			);
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

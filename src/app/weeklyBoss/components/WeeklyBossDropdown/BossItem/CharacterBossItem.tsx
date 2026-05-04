'use client';

import Image from 'next/image';

import BossCheckedIcon from '@assets/svg/check-boss.svg';
import CircleBossIcon from '@assets/svg/circle-boss.svg';
import ResponsiveText from '@components/ResponsiveText/responsiveText';
import { getBossImage, getBossDifficultyValue } from '@data/bosses/bosses';

import styles from './characterBossItem.module.scss';

import type { getBossListBossResponseBody } from '@features/boss/schemas/bossList.response.schema';
import type { JSX, KeyboardEvent } from 'react';

type Props = {
	boss: getBossListBossResponseBody;
	server: string;
	isSelected: boolean;
	onClick?: () => void;
};

const CharacterBossItem = ({ boss, server, isSelected, onClick }: Props): JSX.Element => {
	const handleKey = (event: KeyboardEvent<HTMLDivElement>): void => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onClick?.();
		}
	};

	const bossImg = getBossImage(boss.name);
	const bossValue = getBossDifficultyValue(boss.name, boss.difficulty, server)?.toLocaleString('de-DE');

	return (
		<div
			className={styles.wrapper}
			aria-selected={isSelected}
			onClick={onClick}
			onKeyDown={handleKey}
			role="option"
			tabIndex={0}>
			<Image
				className={styles.bossIcon}
				alt={`${boss.difficulty} ${boss.name}`}
				height={64}
				priority
				src={bossImg}
				width={64}
			/>
			<div className={styles.nameDiv}>
				<ResponsiveText className={styles.bossName} height={34} maxFontSize={28} minFontSize={20} width={284}>
					{boss.difficulty} {boss.name}
				</ResponsiveText>

				<p className={styles.bossValue}>{bossValue}</p>
			</div>

			<div className={styles.iconsDiv}>
				{isSelected ? <BossCheckedIcon className={styles.icon} /> : <CircleBossIcon className={styles.icon} />}
			</div>
		</div>
	);
};
export default CharacterBossItem;

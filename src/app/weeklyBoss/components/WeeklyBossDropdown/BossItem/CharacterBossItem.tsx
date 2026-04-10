'use client';

import Image from 'next/image';

import BossCheckedIcon from '@assets/svg/check-boss.svg';
import CircleBossIcon from '@assets/svg/circle-boss.svg';
import ResponsiveText from '@components/ResponsiveText/responsiveText';
import { getBossImage, getBossDifficultyValue } from '@data/bosses/bosses';

import styles from './characterBossItem.module.scss';

import type { getBossListBossResponseBody } from '@features/Boss/schemas/bossList.response.schema';
import type { JSX, KeyboardEvent } from 'react';

type CharacterBossItemProps = {
	boss: getBossListBossResponseBody;
	server: string;
	isSelected: boolean;
	onClick?: () => void;
};

export default function CharacterBossItem({ boss, server, isSelected, onClick }: CharacterBossItemProps): JSX.Element {
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
			tabIndex={0}
			role="option"
			aria-selected={isSelected}
			onKeyDown={handleKey}
			onClick={onClick}>
			<Image
				className={styles.bossIcon}
				src={bossImg}
				alt={`${boss.difficulty} ${boss.name}`}
				width={64}
				height={64}
				priority
			/>
			<div className={styles.nameDiv}>
				<ResponsiveText className={styles.bossName} width={284} height={34} maxFontSize={28} minFontSize={20}>
					{boss.difficulty} {boss.name}
				</ResponsiveText>
				<p className={styles.bossValue}>{bossValue}</p>
			</div>

			<div className={styles.iconsDiv}>
				{boss.cleared ? <BossCheckedIcon className={styles.icon} /> : <CircleBossIcon className={styles.icon} />}
			</div>
		</div>
	);
}

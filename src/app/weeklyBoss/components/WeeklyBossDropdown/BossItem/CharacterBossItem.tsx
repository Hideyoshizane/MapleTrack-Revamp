'use client';

import { clsx } from 'clsx';
import Image from 'next/image';

import BossCheckedIcon from '@assets/svg/check-boss.svg';
import CircleBossIcon from '@assets/svg/circle-boss.svg';
import SwordIcon from '@assets/svg/sword.svg';
import PartyIcon from '@assets/svg/user-round.svg';
import ResponsiveText from '@components/ResponsiveText/ResponsiveText';
import { getBossImage, getBossDifficultyValue } from '@data/bosses/bosses';

import styles from './CharacterBossItem.module.scss';

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
	const partySize = boss.partySize;
	const bossValue = Math.round(getBossDifficultyValue(boss.name, boss.difficulty, server) / partySize).toLocaleString(
		'de-DE',
	);

	return (
		<div
			className={styles.wrapper}
			aria-selected={isSelected}
			onClick={onClick}
			onKeyDown={handleKey}
			role="option"
			tabIndex={0}
		>
			<Image
				className={styles.bossIcon}
				alt={`${boss.difficulty} ${boss.name}`}
				height={64}
				priority
				src={bossImg}
				width={64}
			/>
			<div className={styles.nameDiv}>
				<div className={styles.nameTextDiv}>
					<p className={clsx(styles.difficulty, styles[boss.difficulty.toLowerCase().replace(/\s+/g, '')])}>
						{boss.difficulty}
					</p>
					<ResponsiveText height={34} maxFontSize={28} minFontSize={20} width={188}>
						{boss.name}
					</ResponsiveText>
				</div>

				<div className={styles.bossValue}>
					<span>{bossValue}</span>

					{partySize > 1 && (
						<div className={styles.partySplit}>
							<PartyIcon className={styles.partyIcon} />
							<span>{partySize}</span>
						</div>
					)}
					{boss.reset === 'Daily' && (
						<div className={styles.partySplit}>
							<SwordIcon className={styles.partyIcon} />
							<span>
								{boss.dailyCleared}/{boss.dailyTotal}
							</span>
						</div>
					)}
				</div>
			</div>

			<div className={styles.iconsDiv}>
				{isSelected ? <BossCheckedIcon className={styles.icon} /> : <CircleBossIcon className={styles.icon} />}
			</div>
		</div>
	);
};
export default CharacterBossItem;

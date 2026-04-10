'use client';

import { bosses } from '@data/bosses/bosses';

import BossItem from '../BossItem/bossItem';

import styles from './bossGrid.module.scss';

import type { getEditBossListCharacterResponseBody } from '@/features/Boss/schemas/bossList.response.schema';
import type { BossName, BossDifficultyName, BossReset } from '@data/bosses/bosses';
import type { JSX } from 'react';

type BossGridProps = {
	serverCookie: string;
	selectedCharacter: getEditBossListCharacterResponseBody | null;
	onBossUpdate: (
		bossName: BossName,
		difficulty: BossDifficultyName,
		server: string,
		reset: BossReset,
		dailyTotal?: number,
	) => void;
};

const BossGrid = ({ serverCookie, selectedCharacter, onBossUpdate }: BossGridProps): JSX.Element => {
	const selectedBosses = selectedCharacter?.bosses ?? [];
	return (
		<div className={styles.classGrid}>
			{bosses.map((boss): JSX.Element => {
				const selections = selectedBosses.filter((b) => b.name === boss.name);
				return (
					<BossItem
						key={boss.name}
						serverCookie={serverCookie}
						selectedCharacterLevel={selectedCharacter?.level ?? 0}
						boss={boss}
						selectedBosses={selections}
						onBossUpdate={onBossUpdate}
					/>
				);
			})}
		</div>
	);
};
export default BossGrid;

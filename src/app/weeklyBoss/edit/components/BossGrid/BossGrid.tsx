'use client';

import { bosses } from '@data/bosses/bosses';

import BossItem from '../BossItem/BossItem';

import styles from './BossGrid.module.scss';

import type { BossName, BossDifficultyName, BossReset } from '@data/bosses/bosses';
import type { getEditBossListCharacterResponseBody } from '@features/boss/schemas/bossList.response.schema';
import type { JSX } from 'react';

type BossGridProps = {
	serverCookie: string;
	selectedCharacter: getEditBossListCharacterResponseBody | null;
	onBossUpdate: (
		bossName: BossName,
		difficulty: BossDifficultyName,
		server: string,
		reset: BossReset,
		partySize: number,
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
						boss={boss}
						key={boss.name}
						onBossUpdate={onBossUpdate}
						selectedBosses={selections}
						selectedCharacterLevel={selectedCharacter?.level ?? 0}
						serverCookie={serverCookie}
					/>
				);
			})}
		</div>
	);
};
export default BossGrid;

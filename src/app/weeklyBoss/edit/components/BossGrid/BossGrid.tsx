'use client';

import { bosses } from '@data/bosses/bosses';

import BossItem from '../BossItem/BossItem';

import styles from './BossGrid.module.scss';

import type { BossCharacterDraft as BossCharacter } from '@features/Boss/bossListModel';
import type { JSX } from 'react';

type BossGridProps = {
	serverCookie: string;
	selectedCharacter: BossCharacter | null;
	onBossUpdate: (
		bossName: string,
		difficulty: string,
		reset: 'Daily' | 'Weekly' | 'Monthly',
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

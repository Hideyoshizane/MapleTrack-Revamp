'use client';

import { useBossListStore } from '@/store/bossListStore';
import { bosses } from '@data/bosses/bosses';

import BossItem from '../BossItem/BossItem';

import styles from './BossGrid.module.scss';

import type { BossCharacterDraft as BossCharacter, BossDraft as Boss } from '@features/Boss/bossListModel';
import type { JSX } from 'react';

type BossGridProps = {
	serverCookie: string;
	selectedCharacter: BossCharacter | null;
};

const BossGrid = ({ serverCookie, selectedCharacter }: BossGridProps): JSX.Element => {
	console.log(selectedCharacter);
	const selectedBosses = useBossListStore((s): Boss[] => s.selectedBosses);

	const selectedBossMap = new Map<string, Boss>();
	for (const b of selectedBosses) {
		selectedBossMap.set(b.name + '_' + b.reset, b);
	}

	// Render content
	return (
		<div className={styles.classGrid}>
			{bosses.map((boss): JSX.Element => {
				const selectedBoss = [...selectedBossMap.values()].find((x): boolean => x.name === boss.name) ?? null;
				return (
					<BossItem
						key={boss.name}
						serverCookie={serverCookie}
						selectedCharacterLevel={selectedCharacter?.level ?? 0}
						boss={boss}
					/>
				);
			})}
		</div>
	);
};
export default BossGrid;

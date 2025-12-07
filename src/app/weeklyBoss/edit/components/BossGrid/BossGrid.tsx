'use client';
import { useMemo } from 'react';

import { useBossListStore } from '@/store/bossListStore';
import { bosses } from '@data/bosses/bosses';

import BossItem from '../BossItem/BossItem';

import styles from './BossGrid.module.scss';

import type { Boss } from '@/models/bossList';
import type { JSX } from 'react';

interface BossGridProps {
	serverCookie: string;
	selectedCharacterLevel: number;
}

const BossGrid = ({ serverCookie, selectedCharacterLevel }: BossGridProps): JSX.Element => {
	const selectedBosses = useBossListStore((s): Boss[] => s.selectedBosses);

	const addOrReplaceBoss = useBossListStore((s): ((boss: Boss) => void) => s.addOrReplaceBoss);

	const removeBoss = useBossListStore((s): ((name: string, reset: Boss['reset']) => void) => s.removeBossFromSelected);

	const selectedBossMap = useMemo((): Map<string, Boss> => {
		const map = new Map<string, Boss>();
		for (const b of selectedBosses) {
			map.set(b.name + '_' + b.reset, b);
		}
		return map;
	}, [selectedBosses]);

	// Render content
	return (
		<div className={styles.classGrid}>
			{bosses.map((boss): JSX.Element => {
				const selected = [...selectedBossMap.values()].find((x): boolean => x.name === boss.name) ?? null;
				return (
					<BossItem
						key={boss.name}
						serverCookie={serverCookie}
						selectedCharacterLevel={selectedCharacterLevel}
						boss={boss}
						selectedBoss={selected}
						onSelect={addOrReplaceBoss}
						onRemove={(reset: Boss['reset']): void => removeBoss(boss.name, reset)}
					/>
				);
			})}
		</div>
	);
};
export default BossGrid;

'use client';

import { useEffect } from 'react';

import type { Boss, WeeklyMonthlyPoints } from '@data/liberation/liberationBosses';
import type { checkedBossResponseBody } from '@features/liberation/schemas/liberation.response.schema';

type BossSelectionState = Record<
	string,
	{
		difficulty: { points: number; reset: string } | null;
		partySize: number;
		excludedWeek: boolean;
		excludedMonth: boolean;
	}
>;

type Props = {
	bosses: Boss[];
	state: BossSelectionState;
	checkedBosses: checkedBossResponseBody[];
	onChange: (data: WeeklyMonthlyPoints) => void;
};

export const useBossesWeeklyMonthlyPoints = ({ bosses, state, checkedBosses, onChange }: Props): void => {
	useEffect(() => {
		const checkedMap: Record<string, checkedBossResponseBody> = {};

		for (const boss of checkedBosses) {
			checkedMap[boss.name] = boss;
		}

		const result: WeeklyMonthlyPoints = {
			thisWeekPoints: 0,
			totalWeeklyPoints: 0,
			thisMonthPoints: 0,
			totalMonthlyPoints: 0,
			bosses: {},
		};

		for (const boss of bosses) {
			const entry = state[boss.name];
			if (!entry?.difficulty) {
				continue;
			}

			const matched = checkedMap[boss.name];
			const isLocked = Boolean(matched && matched.type !== 'Skip');

			const value = Math.round((entry.difficulty.points / entry.partySize) * 100) / 100;

			result.bosses[boss.name] = { points: value, reset: entry.difficulty.reset };

			if (entry.difficulty.reset === 'Weekly') {
				result.totalWeeklyPoints += value;

				if (!isLocked && !entry.excludedWeek) {
					result.thisWeekPoints += value;
				}
			}

			if (entry.difficulty.reset === 'Monthly') {
				result.totalMonthlyPoints += value;

				if (!isLocked && !entry.excludedMonth) {
					result.thisMonthPoints += value;
				}
			}
		}

		onChange(result);
	}, [bosses, state, checkedBosses, onChange]);
};

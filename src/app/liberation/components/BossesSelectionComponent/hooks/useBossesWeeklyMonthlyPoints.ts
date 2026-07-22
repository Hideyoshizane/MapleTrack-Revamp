'use client';

import { useEffect, useRef } from 'react';

import { isAstraDifficulty } from '@data/liberation/liberationBosses';

import type { Boss, BossDifficulty, WeeklyMonthlyPoints } from '@data/liberation/liberationBosses';
import type { checkedBossResponseBody } from '@features/liberation/schemas/liberation.response.schema';

type BossSelectionState = Record<
	string,
	{ difficulty: BossDifficulty | null; partySize: number; excludedWeek: boolean; excludedMonth: boolean }
>;

type Props = {
	bosses: Boss[];
	state: BossSelectionState;
	checkedBosses: checkedBossResponseBody[];
	onChangeAction: (data: WeeklyMonthlyPoints) => void;
};

const createEmptyTotals = (): WeeklyMonthlyPoints => ({
	thisWeekPoints: 0,
	totalWeeklyPoints: 0,
	thisMonthPoints: 0,
	totalMonthlyPoints: 0,
	thisWeekErion: 0,
	totalWeeklyErion: 0,
	thisWeekBattle: 0,
	totalWeeklyBattle: 0,
	bosses: {},
});

const areWeeklyMonthlyPointsEqual = (left: WeeklyMonthlyPoints, right: WeeklyMonthlyPoints): boolean =>
	JSON.stringify(left) === JSON.stringify(right);

const roundToTwoDecimals = (value: number): number => Math.round(value * 100) / 100;

export const useBossesWeeklyMonthlyPoints = ({ bosses, state, checkedBosses, onChangeAction }: Props): void => {
	const previousResultRef = useRef<WeeklyMonthlyPoints | null>(null);

	useEffect(() => {
		const checkedMap: Record<string, checkedBossResponseBody> = {};

		for (const boss of checkedBosses) {
			checkedMap[boss.name] = boss;
		}

		const result = createEmptyTotals();

		for (const boss of bosses) {
			const entry = state[boss.name];
			if (!entry?.difficulty) {
				continue;
			}

			const { difficulty, partySize } = entry;
			const { reset } = difficulty;
			const isWeekly = reset === 'Weekly';

			const matched = checkedMap[boss.name];
			const isLocked = Boolean(matched?.cleared);
			const isIncludedInCurrentPeriod = !isLocked && (isWeekly ? !entry.excludedWeek : !entry.excludedMonth);

			if (isAstraDifficulty(difficulty)) {
				const erionValue = roundToTwoDecimals(difficulty.erion / partySize);
				const battleValue = roundToTwoDecimals(difficulty.battle / partySize);

				result.bosses[boss.name] = {
					erion: erionValue,
					battle: battleValue,
					reset,
				};

				if (isWeekly) {
					result.totalWeeklyErion += erionValue;
					result.totalWeeklyBattle += battleValue;

					if (isIncludedInCurrentPeriod) {
						result.thisWeekErion += erionValue;
						result.thisWeekBattle += battleValue;
					}
				}

				continue;
			}

			const pointsValue = roundToTwoDecimals(difficulty.points / partySize);

			result.bosses[boss.name] = {
				points: pointsValue,
				reset,
			};

			if (isWeekly) {
				result.totalWeeklyPoints += pointsValue;

				if (isIncludedInCurrentPeriod) {
					result.thisWeekPoints += pointsValue;
				}
			} else {
				result.totalMonthlyPoints += pointsValue;

				if (isIncludedInCurrentPeriod) {
					result.thisMonthPoints += pointsValue;
				}
			}
		}

		if (previousResultRef.current && areWeeklyMonthlyPointsEqual(previousResultRef.current, result)) {
			return;
		}

		previousResultRef.current = result;
		onChangeAction(result);
	}, [bosses, state, checkedBosses, onChangeAction]);
};

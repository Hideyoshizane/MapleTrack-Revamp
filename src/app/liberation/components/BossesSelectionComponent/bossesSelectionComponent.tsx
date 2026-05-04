'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import ResponsiveText from '@components/ResponsiveText/responsiveText';

import BossesDifficultySelector from './BossesDifficultySelector/bossesDifficultySelector';
import styles from './bossesSelectionComponent.module.scss';
import CheckedIcon from './CheckedIcon/checkedIcon';
import PartySizeSelector from './PartySizeSelector/partySizeSelector';

import type { Boss, BossDifficulty, WeeklyMonthlyPoints } from '@data/liberation/liberationBosses';
import type { checkedBossResponseBody } from '@features/liberation/schemas/liberation.response.schema';
import type { JSX } from 'react';

type Props = {
	type: string;
	bosses: Boss[];
	checkedBosses: checkedBossResponseBody[];
	onChangeWeeklyTotals: (data: WeeklyMonthlyPoints) => void;
};

type BossSelectionState = Record<
	string,
	{ difficulty: BossDifficulty | null; partySize: number; excludedWeek: boolean; excludedMonth: boolean }
>;

const buildCheckedMap = (checkedBosses: checkedBossResponseBody[]): Record<string, checkedBossResponseBody> => {
	const map: Record<string, checkedBossResponseBody> = {};
	for (const boss of checkedBosses) {
		map[boss.name] = boss;
	}
	return map;
};

const BossesSelectionComponent = ({ type, bosses, checkedBosses, onChangeWeeklyTotals }: Props): JSX.Element => {
	const [state, setState] = useState<BossSelectionState>({});
	const checkedMap = buildCheckedMap(checkedBosses);

	useEffect((): void => {
		const nextState: BossSelectionState = {};

		for (const boss of bosses) {
			const matched = checkedMap[boss.name];
			const isLocked = Boolean(matched && matched.type !== 'Skip');

			let difficulty: BossDifficulty | null = null;

			if (matched && matched.type !== 'Skip') {
				difficulty = boss.difficulties.find((d) => d.name === matched.type) ?? null;
			}

			nextState[boss.name] = { difficulty, partySize: 1, excludedWeek: isLocked, excludedMonth: isLocked };
		}

		setState(nextState);
	}, [bosses, checkedBosses]);

	const handleSelectDifficulty = (bossName: string, difficulty: BossDifficulty): void => {
		setState((prev) => {
			const current = prev[bossName];
			if (!current) {
				return prev;
			}

			if (difficulty.name === 'Skip') {
				return { ...prev, [bossName]: { ...current, difficulty: null } };
			}

			return { ...prev, [bossName]: { ...current, difficulty } };
		});
	};

	const handleSelectPartySize = (bossName: string, partySize: number): void => {
		setState((prev) => {
			const current = prev[bossName];
			if (!current) {
				return prev;
			}

			return { ...prev, [bossName]: { ...current, partySize } };
		});
	};

	const handleToggleIncluded = (bossName: string): void => {
		setState((prev) => {
			const current = prev[bossName];
			if (!current || !current.difficulty) {
				return prev;
			}

			const matched = checkedMap[bossName];
			const isLocked = Boolean(matched && matched.type !== 'Skip');

			if (isLocked) {
				return prev;
			}

			if (current.difficulty.reset === 'Weekly') {
				return { ...prev, [bossName]: { ...current, excludedWeek: !current.excludedWeek } };
			}

			return { ...prev, [bossName]: { ...current, excludedMonth: !current.excludedMonth } };
		});
	};

	useEffect((): void => {
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

			const { difficulty, partySize, excludedWeek, excludedMonth } = entry;

			const matched = checkedMap[boss.name];
			const isLocked = Boolean(matched && matched.type !== 'Skip');

			const value = Math.round((difficulty.points / partySize) * 100) / 100;

			result.bosses[boss.name] = {
				points: value,
				reset: difficulty.reset,
			};

			if (difficulty.reset === 'Weekly') {
				result.totalWeeklyPoints += value;

				if (!isLocked && !excludedWeek) {
					result.thisWeekPoints += value;
				}
			}

			if (difficulty.reset === 'Monthly') {
				result.totalMonthlyPoints += value;

				if (!isLocked && !excludedMonth) {
					result.thisMonthPoints += value;
				}
			}
		}

		onChangeWeeklyTotals(result);
	}, [bosses, state, checkedBosses, onChangeWeeklyTotals]);

	return (
		<div className={styles.bossesDiv}>
			<p className={styles.title}>Bosses</p>
			<p className={styles.subTitle}>Select the boss, difficulty and party size.</p>

			<div className={styles.titleDiv}>
				<p className={styles.menuBoss}>Boss</p>
				<p className={styles.menuDifficulty}>Difficulty</p>
				<p className={styles.menuParty}>Party</p>
				<p className={styles.menuCleared}>Cleared</p>
			</div>

			<div className={styles.bossList}>
				{bosses.map((boss): JSX.Element => {
					const entry = state[boss.name];

					const selectedDifficulty = entry?.difficulty ?? null;
					const selectedPartySize = entry?.partySize ?? 1;

					const matched = checkedBosses.find((b) => b.name === boss.name);
					const isLocked = Boolean(matched && matched.type !== 'Skip');

					const isSkip = !selectedDifficulty;
					const isDisabled = isLocked || isSkip;

					const isExcluded = selectedDifficulty?.reset === 'Weekly' ? entry?.excludedWeek : entry?.excludedMonth;

					return (
						<div className={styles.bossCard} key={boss.name}>
							<Image alt={boss.name} height={56} src={boss.img} width={56} />

							<ResponsiveText height={28} maxFontSize={24} minFontSize={16} width={108}>
								{boss.name}
							</ResponsiveText>

							<BossesDifficultySelector
								difficulties={boss.difficulties}
								onChangeDifficulty={(difficulty): void => handleSelectDifficulty(boss.name, difficulty)}
								selectedDifficultyName={selectedDifficulty?.name ?? null}
								type={type}
							/>

							<PartySizeSelector
								onChangePartySize={(multiplier): void => handleSelectPartySize(boss.name, multiplier)}
								selectedPartySize={selectedPartySize}
							/>

							<CheckedIcon
								checkedBoss={matched?.type}
								disabled={isDisabled}
								isIncluded={!isExcluded}
								isSkip={isSkip}
								onToggle={(): void => handleToggleIncluded(boss.name)}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default BossesSelectionComponent;

'use client';

import Image from 'next/image';
import { useState } from 'react';

import ResponsiveText from '@components/ResponsiveText/ResponsiveText';
import { normalizeBossType } from '@data/liberation/liberationBosses';

import BossesDifficultySelector from './BossesDifficultySelector/BossesDifficultySelector';
import styles from './BossesSelectionComponent.module.scss';
import CheckedIcon from './CheckedIcon/CheckedIcon';
import { useBossesWeeklyMonthlyPoints } from './hooks/useBossesWeeklyMonthlyPoints';
import PartySizeSelector from './PartySizeSelector/PartySizeSelector';

import type { Boss, BossDifficulty, WeeklyMonthlyPoints } from '@data/liberation/liberationBosses';
import type { checkedBossResponseBody } from '@features/liberation/schemas/liberation.response.schema';
import type { JSX } from 'react';

type Props = {
	rawType: string;
	bosses: Boss[];
	checkedBosses: checkedBossResponseBody[];
	onChangeWeeklyTotals: (data: WeeklyMonthlyPoints) => void;
};

type BossSelectionState = Record<
	string,
	{
		difficulty: BossDifficulty | null;
		partySize: number;
		excludedWeek: boolean;
		excludedMonth: boolean;
	}
>;

const buildCheckedMap = (checkedBosses: checkedBossResponseBody[]): Record<string, checkedBossResponseBody> => {
	const map: Record<string, checkedBossResponseBody> = {};

	for (const boss of checkedBosses) {
		map[boss.name] = boss;
	}

	return map;
};

const createBossSelectionState = (bosses: Boss[], checkedBosses: checkedBossResponseBody[]): BossSelectionState => {
	const checkedMap = buildCheckedMap(checkedBosses);

	return bosses.reduce<BossSelectionState>((state, boss) => {
		const matched = checkedMap[boss.name];
		const isLocked = Boolean(matched?.cleared);

		const difficulty =
			matched && matched.type !== 'Skip'
				? (boss.difficulties.find((difficulty) => difficulty.name === matched.type) ?? null)
				: null;

		state[boss.name] = {
			difficulty,
			partySize: matched?.partySize ?? 1,
			excludedWeek: isLocked,
			excludedMonth: isLocked,
		};

		return state;
	}, {});
};

const BossesSelectionComponent = ({ rawType, bosses, checkedBosses, onChangeWeeklyTotals }: Props): JSX.Element => {
	const [state, setState] = useState<BossSelectionState>(() => createBossSelectionState(bosses, checkedBosses));

	const [prevBosses, setPrevBosses] = useState(bosses);
	const [prevCheckedBosses, setPrevCheckedBosses] = useState(checkedBosses);

	if (bosses !== prevBosses || checkedBosses !== prevCheckedBosses) {
		setPrevBosses(bosses);
		setPrevCheckedBosses(checkedBosses);
		setState(createBossSelectionState(bosses, checkedBosses));
	}

	const type = normalizeBossType(rawType);

	const checkedMap = buildCheckedMap(checkedBosses);

	useBossesWeeklyMonthlyPoints({ bosses, state, checkedBosses, onChangeAction: onChangeWeeklyTotals });

	const handleSelectDifficulty = (bossName: string, difficulty: BossDifficulty): void => {
		setState((prev) => {
			const current = prev[bossName];
			if (!current) {
				return prev;
			}

			return { ...prev, [bossName]: { ...current, difficulty: difficulty.name === 'Skip' ? null : difficulty } };
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
			const isLocked = Boolean(matched?.cleared);

			if (isLocked) {
				return prev;
			}

			if (current.difficulty.reset === 'Weekly') {
				return { ...prev, [bossName]: { ...current, excludedWeek: !current.excludedWeek } };
			}

			return { ...prev, [bossName]: { ...current, excludedMonth: !current.excludedMonth } };
		});
	};

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
					const isLocked = Boolean(matched?.cleared);

					const isSkip = !selectedDifficulty;
					const isDisabled = isLocked || isSkip;

					const isExcluded =
						selectedDifficulty?.reset === 'Weekly' ? entry?.excludedWeek : entry?.excludedMonth;

					return (
						<div className={styles.bossCard} key={boss.name}>
							<Image alt={boss.name} height={56} src={boss.img} width={56} />

							<ResponsiveText height={28} maxFontSize={24} minFontSize={16} width={108}>
								{boss.name}
							</ResponsiveText>

							<BossesDifficultySelector
								difficulties={boss.difficulties}
								onChangeDifficulty={(d): void => handleSelectDifficulty(boss.name, d)}
								selectedDifficultyName={selectedDifficulty?.name ?? null}
								type={type}
							/>

							<PartySizeSelector
								onChangePartySize={(v): void => handleSelectPartySize(boss.name, v)}
								selectedPartySize={selectedPartySize}
								maxPartySize={boss.maxPartySize}
							/>

							<CheckedIcon
								cleared={matched?.cleared ?? false}
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

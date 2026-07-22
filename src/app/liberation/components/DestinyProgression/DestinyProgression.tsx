'use client';

import { clsx } from 'clsx';
import { startOfDay } from 'date-fns';
import { redirect } from 'next/navigation';
import { useState } from 'react';

import LockIcon from '@assets/svg/lock.svg';
import { DESTINY_MIN_LEVEL } from '@data/liberation/constant';
import { getBossesByType, createEmptyWeeklyMonthlyPoints } from '@data/liberation/liberationBosses';
import { getQuestsByType, getLiberationTotal } from '@data/liberation/liberationQuests';

import { calculateQuestPoints, calculateCumulativePoints } from '../../lib/calculatePoints';
import BossesSelectionComponent from '../BossesSelectionComponent/BossesSelectionComponent';
import PointsInput from '../PointsInput/PointsInput';
import ProgressionBarDiv from '../ProgressionBarDiv/ProgressionBarDiv';
import ProgressPrevision from '../ProgressPrevision/ProgressPrevision';
import QuestDropdown from '../QuestDropdown/QuestDropdown';
import WeeklyBreakdown from '../WeeklyBreakdown/WeeklyBreakdown';

import styles from './DestinyProgression.module.scss';
import DestinySchedule from './DestinySchedule/DestinySchedule';
import { useDestinyCheckedBosses } from './hooks/useDestinyCheckedBosses';
import { useDestinyProgressionState } from './hooks/useDestinyProgressionState';

import type { WeeklyMonthlyPoints } from '@data/liberation/liberationBosses';
import type { GetLiberationListCharacterResponseBody } from '@features/liberation/schemas/liberation.response.schema';
import type { JSX } from 'react';

type Props = {
	selectedCharacter: GetLiberationListCharacterResponseBody | null;
	currentDate: Date;
	server: string;
	onCharacterUpdate?: (updated: Partial<GetLiberationListCharacterResponseBody>) => void;
};

export const QUEST_TYPE = 'Destiny';

const bosses = getBossesByType(QUEST_TYPE);
const totalPoints = getLiberationTotal(QUEST_TYPE);

const DestinyProgression = ({ selectedCharacter, currentDate, server, onCharacterUpdate }: Props): JSX.Element => {
	const destinyQuests = getQuestsByType(QUEST_TYPE);
	if (!destinyQuests || !selectedCharacter) {
		redirect('/error');
	}

	const [selectedDate, setSelectedDate] = useState<Date>(currentDate);

	const { selectedQuest, setSelectedQuest, determinationPoints, setDeterminationPoints } = useDestinyProgressionState(
		{
			selectedCharacter,
			onCharacterUpdateAction: onCharacterUpdate,
		},
	);

	const checkedBosses = useDestinyCheckedBosses({
		characterId: selectedCharacter.characterId,
		server,
		currentDate,
		selectedDate,
		type: QUEST_TYPE,
	});

	const [weeklyMonthlyPoints, setWeeklyMonthlyPoints] = useState<WeeklyMonthlyPoints>(
		createEmptyWeeklyMonthlyPoints(),
	);

	const liberated = selectedCharacter.liberated;

	const isDestinyAvaiable = (selectedCharacter.level ?? 0) >= DESTINY_MIN_LEVEL && liberated;

	const questPoints = Number(calculateQuestPoints(selectedQuest, QUEST_TYPE) ?? 0);

	const cumulative = Number(calculateCumulativePoints(selectedQuest, QUEST_TYPE, determinationPoints) ?? 0);

	const remainingTotal = totalPoints - cumulative;
	const remainingCurrent = questPoints - determinationPoints;

	return (
		<div>
			<div className={styles.currentProgressWrapper}>
				{!isDestinyAvaiable && (
					<div className={styles.disabledOverlay}>
						<div className={styles.overlayContent}>
							<LockIcon height={56} width={56} />
							<p className={styles.title}>Level Requirement Not Met</p>
							<p className={styles.description}>
								Destiny Liberation tracker is available only for characters level {DESTINY_MIN_LEVEL} or
								higher who completed Genesis Liberation.
							</p>
						</div>
					</div>
				)}

				<div className={clsx(styles.currentProgress, { [styles.disabled]: !isDestinyAvaiable })}>
					<p className={styles.title}>Current Progress</p>

					<div className={styles.progressInput}>
						<div>
							<p className={styles.inputTitle}>Current Mission</p>
							<QuestDropdown
								onSelectBoss={setSelectedQuest}
								quest={destinyQuests}
								selectedQuest={selectedQuest}
								type={QUEST_TYPE}
							/>
						</div>

						<div>
							<p className={styles.inputTitle}>Current Determination</p>
							<PointsInput
								onChangePoints={setDeterminationPoints}
								points={determinationPoints}
								type={QUEST_TYPE}
							/>
						</div>
					</div>

					<ProgressionBarDiv
						cumulativeTracesPoints={cumulative}
						currentPoints={determinationPoints}
						questPoints={questPoints}
						totalPoints={totalPoints}
						type={'destiny'}
					/>
				</div>
			</div>

			<div className={styles.grid}>
				<div className={styles.column}>
					<ProgressPrevision
						onChangeDate={(value: string): void => {
							const [y, m, d] = value.split('-').map(Number);
							setSelectedDate(startOfDay(new Date(y, m - 1, d)));
						}}
						selectedDate={selectedDate}
					/>

					<BossesSelectionComponent
						bosses={bosses}
						checkedBosses={checkedBosses}
						onChangeWeeklyTotals={setWeeklyMonthlyPoints}
						rawType={QUEST_TYPE}
					/>
				</div>

				<div className={styles.column}>
					<DestinySchedule
						remainingCurrentDetermination={remainingCurrent}
						remainingTotalDetermination={remainingTotal}
						selectedDate={selectedDate}
						selectedQuest={selectedQuest}
						weeklyMonthlyPoints={weeklyMonthlyPoints}
					/>

					<WeeklyBreakdown bosses={bosses} type={QUEST_TYPE} weeklyMonthlyPoints={weeklyMonthlyPoints} />
				</div>
			</div>
		</div>
	);
};

export default DestinyProgression;

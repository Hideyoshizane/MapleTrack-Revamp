'use client';

import { clsx } from 'clsx';
import { startOfDay } from 'date-fns';
import { redirect } from 'next/navigation';
import { useState } from 'react';

import LockIcon from '@assets/svg/lock.svg';
import { ASTRA_MIN_LEVEL } from '@data/liberation/constant';
import { getBossesByType, createEmptyWeeklyMonthlyPoints } from '@data/liberation/liberationBosses';
import { getAstraQuest, getAstraPoints, getCumulativeAstraPoints } from '@data/liberation/liberationQuests';

import BossesSelectionComponent from '../BossesSelectionComponent/BossesSelectionComponent';
import DailySelectDropdown from '../DailySelectDropdown/DailySelectDropdown';
import PointsInput from '../PointsInput/PointsInput';
import ProgressPrevision from '../ProgressPrevision/ProgressPrevision';
import QuestDropdown from '../QuestDropdown/QuestDropdown';
import WeeklyBreakdown from '../WeeklyBreakdown/WeeklyBreakdown';

import styles from './AstraProgression.module.scss';
import AstraProgressionBarDiv from './components/AstraProgressionBarDiv/AstraProgressionBarDiv';
import AstraSchedule from './components/AstraSchedule/AstraSchedule';
import { useAstraCheckedBosses } from './hooks/useAstraCheckedBosses';
import { useAstraProgressionState } from './hooks/useAstraProgressionState';

import type { WeeklyMonthlyPoints } from '@data/liberation/liberationBosses';
import type { GetLiberationListCharacterResponseBody } from '@features/liberation/schemas/liberation.response.schema';
import type { JSX } from 'react';

type Props = {
	selectedCharacter: GetLiberationListCharacterResponseBody | null;
	currentDate: Date;
	server: string;
	onCharacterUpdate?: (updated: Partial<GetLiberationListCharacterResponseBody>) => void;
};

export const QUEST_TYPE = 'Astra';

const bosses = getBossesByType(QUEST_TYPE);

const AstraProgression = ({ selectedCharacter, currentDate, server, onCharacterUpdate }: Props): JSX.Element => {
	const astraQuests = getAstraQuest();
	if (!astraQuests || !selectedCharacter) {
		redirect('/error');
	}

	const [selectedDate, setSelectedDate] = useState<Date>(currentDate);

	const { selectedQuest, setSelectedQuest, vestigePoints, setVestigePoints, tracePoints, setTracePoints } =
		useAstraProgressionState({ selectedCharacter, onCharacterUpdateAction: onCharacterUpdate });

	const checkedBosses = useAstraCheckedBosses({
		characterId: selectedCharacter.characterId,
		server,
		currentDate,
		selectedDate,
		type: QUEST_TYPE,
	});

	const [weeklyMonthlyPoints, setWeeklyMonthlyPoints] = useState<WeeklyMonthlyPoints>(
		createEmptyWeeklyMonthlyPoints(),
	);

	const [selectedDailyPreview, setSelectedDailyPreview] = useState<number>(0);

	const liberated = selectedCharacter.liberated;

	const isAstraAvaiable = (selectedCharacter.level ?? 0) >= ASTRA_MIN_LEVEL && liberated;

	const { vestiges: astraVestigesQuest, traces: astraTracesQuest } = getAstraPoints(selectedQuest || '');
	const cumulative = getCumulativeAstraPoints(selectedQuest || '', false);

	return (
		<div>
			<div className={styles.currentProgressWrapper}>
				{!isAstraAvaiable && (
					<div className={styles.disabledOverlay}>
						<div className={styles.overlayContent}>
							<LockIcon height={56} width={56} />
							<p className={styles.title}>Level Requirement Not Met</p>
							<p className={styles.description}>
								Astra Weapon tracker is available only for characters level {ASTRA_MIN_LEVEL} or higher
								who completed Genesis Liberation.
							</p>
						</div>
					</div>
				)}

				<div className={clsx(styles.currentProgress, { [styles.disabled]: !isAstraAvaiable })}>
					<p className={styles.title}>Current Progress</p>

					<div className={styles.progressInput}>
						<div>
							<p className={styles.inputTitle}>Current Mission</p>
							<QuestDropdown
								onSelectBoss={setSelectedQuest}
								quest={astraQuests}
								selectedQuest={selectedQuest}
								type={QUEST_TYPE}
							/>
						</div>

						<div>
							<p className={styles.inputTitle}>Current Vestiges</p>
							<PointsInput
								onChangePoints={setVestigePoints}
								points={vestigePoints}
								type={'astra_erion'}
							/>
						</div>
						<div>
							<p className={styles.inputTitle}>Current Traces</p>
							<PointsInput onChangePoints={setTracePoints} points={tracePoints} type={'astra_battle'} />
						</div>
					</div>

					<AstraProgressionBarDiv
						cumulativeTraces={cumulative.traces}
						cumulativeVestiges={cumulative.vestiges}
						currentTraces={tracePoints}
						currentVestiges={vestigePoints}
						tracesQuestPoints={astraTracesQuest}
						vestigesQuestPoints={astraVestigesQuest}
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
					<DailySelectDropdown
						onSelectArea={setSelectedDailyPreview}
						selectedDailyPreview={selectedDailyPreview}
					/>

					<BossesSelectionComponent
						bosses={bosses}
						checkedBosses={checkedBosses}
						onChangeWeeklyTotals={setWeeklyMonthlyPoints}
						rawType={QUEST_TYPE}
					/>
				</div>

				<div className={styles.column}>
					<AstraSchedule
						currentTraces={tracePoints}
						currentVestiges={vestigePoints}
						selectedDailyPreview={selectedDailyPreview}
						selectedDate={selectedDate}
						selectedQuest={selectedQuest}
						tracesQuestPoints={astraTracesQuest}
						vestigesQuestPoints={astraVestigesQuest}
						weeklyMonthlyPoints={weeklyMonthlyPoints}
					/>

					<WeeklyBreakdown bosses={bosses} type={QUEST_TYPE} weeklyMonthlyPoints={weeklyMonthlyPoints} />
				</div>
			</div>
		</div>
	);
};

export default AstraProgression;

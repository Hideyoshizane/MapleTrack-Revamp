'use client';

import { clsx } from 'clsx';
import { startOfDay } from 'date-fns';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { useState } from 'react';

import CheckedIcon from '@assets/svg/check-boss.svg';
import CircleIcon from '@assets/svg/circle-boss.svg';
import LockIcon from '@assets/svg/lock.svg';
import Tooltip from '@components/Tooltip/tooltip';
import { GENESIS_MIN_LEVEL } from '@data/liberation/constant';
import { getBossesByType } from '@data/liberation/liberationBosses';
import { getQuestsByType, getLiberationTotal } from '@data/liberation/liberationQuests';

import { calculateQuestPoints, calculateCumulativePoints } from '../../lib/calculatePoints';
import BossesSelectionComponent from '../BossesSelectionComponent/bossesSelectionComponent';
import PointsInput from '../pointsInput/pointsInput';
import ProgressionBarDiv from '../ProgressionBarDiv/progressionBarDiv';
import ProgressPrevision from '../ProgressPrevision/progressPrevision';
import QuestDropdown from '../QuestDropdown/questDropdown';
import WeeklyBreakdown from '../WeeklyBreakdown/weeklyBreakdown';

import styles from './genesisProgression.module.scss';
import GenesisSchedule from './genesisSchedule/genesisSchedule';
import { useCheckedBosses } from './hooks/useCheckedBosses';
import { useGenesisProgressionState } from './hooks/useGenesisProgressionState';

import type { WeeklyMonthlyPoints } from '@data/liberation/liberationBosses';
import type { GetLiberationListCharacterResponseBody } from '@features/liberation/schemas/liberation.response.schema';
import type { JSX } from 'react';

type Props = {
	selectedCharacter: GetLiberationListCharacterResponseBody | null;
	currentDate: Date;
	server: string;
	onCharacterUpdate?: (updated: Partial<GetLiberationListCharacterResponseBody>) => void;
};

export const QUEST_TYPE = 'Genesis';

const GenesisProgression = ({ selectedCharacter, currentDate, server, onCharacterUpdate }: Props): JSX.Element => {
	const genesisQuests = getQuestsByType(QUEST_TYPE);
	if (!genesisQuests || !selectedCharacter) {
		redirect('/error');
	}

	const [selectedDate, setSelectedDate] = useState<Date>(currentDate);

	const {
		selectedQuest,
		setSelectedQuest,
		tracesPoints,
		setTracesPoints,
		genesisPass,
		setGenesisPass,
		liberated,
		handleLiberatedToggle,
	} = useGenesisProgressionState({ selectedCharacter, onCharacterUpdate });

	const checkedBosses = useCheckedBosses({
		characterId: selectedCharacter.characterId,
		server,
		currentDate,
		selectedDate,
		type: QUEST_TYPE,
	});

	const bosses = getBossesByType(QUEST_TYPE);
	const totalPoints = getLiberationTotal(QUEST_TYPE);

	const questPoints = Number(calculateQuestPoints(selectedQuest, QUEST_TYPE) ?? 0);
	const cumulativeTracesPoints = Number(calculateCumulativePoints(selectedQuest, QUEST_TYPE, tracesPoints) ?? 0);

	const remainingTotalTraces = totalPoints - cumulativeTracesPoints;
	const remainingCurrentTraces = questPoints - tracesPoints;

	const isGenesisAvaiable = (selectedCharacter.level ?? 0) >= GENESIS_MIN_LEVEL;

	const [weeklyMonthlyPoints, setWeeklyMonthlyPoints] = useState<WeeklyMonthlyPoints>({
		thisWeekPoints: 0,
		totalWeeklyPoints: 0,
		thisMonthPoints: 0,
		totalMonthlyPoints: 0,
		bosses: {},
	});

	const IconComponent = liberated ? CheckedIcon : CircleIcon;

	return (
		<div>
			<div className={styles.currentProgressWrapper}>
				{!isGenesisAvaiable && (
					<div className={styles.disabledOverlay}>
						<div className={styles.overlayContent}>
							<LockIcon height={56} width={56} />
							<p className={styles.title}>Level Requirement Not Met</p>
							<p className={styles.description}>
								Genesis Liberation tracker is available only for characters level {GENESIS_MIN_LEVEL} or higher.
							</p>
						</div>
					</div>
				)}

				<div className={clsx(styles.currentProgress, { [styles.disabled]: !isGenesisAvaiable })}>
					<p className={styles.title}>Current Progress</p>

					<div className={styles.progressInput}>
						<div>
							<p className={styles.inputTitle}>Current Mission</p>
							<QuestDropdown
								onSelectBoss={setSelectedQuest}
								quest={genesisQuests}
								selectedQuest={selectedQuest}
								type={QUEST_TYPE}
							/>
						</div>

						<div>
							<p className={styles.inputTitle}>Current Traces</p>
							<PointsInput onChangePoints={setTracesPoints} points={tracesPoints} />
						</div>

						<div className={styles.toggleDiv}>
							<p className={styles.inputTitle}>Genesis Pass</p>
							<Image
								className={clsx(styles.genesisPass, { [styles.off]: !genesisPass })}
								alt="Genesis Pass"
								height={64}
								onClick={(): void => setGenesisPass((prev) => !prev)}
								src="/assets/icons/menu/genesisPass.webp"
								width={88}
							/>
						</div>

						<div className={styles.toggleDiv}>
							<p className={styles.inputTitle}>Liberated</p>
							<Tooltip
								content="Required for Destiny Liberation. Updates automatically as you earn points or enter them manually."
								placement="top">
								<IconComponent
									className={styles.liberatedIcon}
									height={56}
									onClick={handleLiberatedToggle}
									width={56}
								/>
							</Tooltip>
						</div>
					</div>

					<ProgressionBarDiv
						cumulativeTracesPoints={cumulativeTracesPoints}
						currentPoints={tracesPoints}
						questPoints={questPoints}
						totalPoints={totalPoints}
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
						type={QUEST_TYPE}
					/>
				</div>

				<div className={styles.column}>
					<GenesisSchedule
						disableProgress={!isGenesisAvaiable}
						genesisPass={genesisPass}
						handleToggleGenesisPass={(): void => setGenesisPass((p) => !p)}
						remainingCurrentTraces={remainingCurrentTraces}
						remainingTotalTraces={remainingTotalTraces}
						selectedDate={selectedDate}
						weeklyMonthlyPoints={weeklyMonthlyPoints}
					/>

					<WeeklyBreakdown bosses={bosses} type={QUEST_TYPE} weeklyMonthlyPoints={weeklyMonthlyPoints} />
				</div>
			</div>
		</div>
	);
};

export default GenesisProgression;

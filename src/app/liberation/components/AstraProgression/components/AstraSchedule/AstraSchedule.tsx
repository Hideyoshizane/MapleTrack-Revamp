'use client';

import { getCumulativeAstraPoints, getAstraPoints } from '@data/liberation/liberationQuests';

import { calculateAstraSchedule, formatUTC } from '../../../../lib/calculateSchedule';

import styles from './AstraSchedule.module.scss';

import type { WeeklyMonthlyPoints } from '@data/liberation/liberationBosses';
import type { JSX } from 'react';

type Props = {
	currentTraces: number;
	currentVestiges: number;
	selectedDailyPreview: number;
	selectedDate: Date;
	selectedQuest: string | null;
	tracesQuestPoints: number;
	vestigesQuestPoints: number;
	weeklyMonthlyPoints: WeeklyMonthlyPoints;
};

const AstraSchedule = ({
	currentTraces,
	currentVestiges,
	selectedDailyPreview,
	selectedDate,
	selectedQuest,
	tracesQuestPoints,
	vestigesQuestPoints,
	weeklyMonthlyPoints,
}: Props): JSX.Element => {
	const secondQuestOnlyPoints = getAstraPoints('Second');
	const thirdQuestOnlyPoints = getAstraPoints('Third');

	const secondQuestPoints = getCumulativeAstraPoints('Second', true);
	const thirdQuestPoints = getCumulativeAstraPoints('Third', true);

	const isFirstMission = selectedQuest == 'First';
	const isSecondMission = selectedQuest == 'Second';
	const isThirdMission = !isFirstMission && !isSecondMission;

	const totalWeeklyVestiges = weeklyMonthlyPoints.totalWeeklyErion + selectedDailyPreview;
	const totalWeeklyBattle = weeklyMonthlyPoints.totalWeeklyBattle;

	const remainingVestigesCurrentQuest = vestigesQuestPoints - currentVestiges;
	const remainingTracesCurrentQuest = tracesQuestPoints - currentTraces;

	const currentMissionSchedule = calculateAstraSchedule({
		selectedDate: selectedDate,
		remainingErion: remainingVestigesCurrentQuest,
		remainingBattle: remainingTracesCurrentQuest,
		dailyValues: selectedDailyPreview,
		weeklyMonthlyPoints,
	});

	const SecondQuestSchedule = isFirstMission
		? calculateAstraSchedule({
				selectedDate: selectedDate,
				remainingErion: secondQuestPoints.vestiges,
				remainingBattle: secondQuestPoints.traces,
				dailyValues: selectedDailyPreview,
				weeklyMonthlyPoints,
			})
		: null;

	const ThirdQuestSchedule = !isThirdMission
		? calculateAstraSchedule({
				selectedDate: selectedDate,
				remainingErion: thirdQuestPoints.vestiges,
				remainingBattle: thirdQuestPoints.traces,
				dailyValues: selectedDailyPreview,
				weeklyMonthlyPoints,
			})
		: null;

	return (
		<div className={styles.mainDiv}>
			<div className={styles.titleDiv}>
				<p className={styles.title}>Liberation Schedule</p>
			</div>

			<div className={styles.line}>
				<p>Start Date:</p>
				<div>{formatUTC(selectedDate)}</div>
			</div>

			<div className={styles.line}>
				<p>This Week Remaining Vestiges of Erion:</p>
				<p>{weeklyMonthlyPoints.thisWeekErion}</p>
			</div>

			<div className={styles.line}>
				<p>Weekly Vestiges of Erion:</p>
				<p>{totalWeeklyVestiges}</p>
			</div>

			<div className={styles.line}>
				<p>This Week Remaining Traces of Battle:</p>
				<p>{weeklyMonthlyPoints.thisWeekBattle}</p>
			</div>

			<div className={styles.line}>
				<p>Weekly Traces of Battle:</p>
				<p>{totalWeeklyBattle}</p>
			</div>

			<hr className={styles.lineBreak} />

			<div className={styles.line}>
				<p>Weeks to Complete Current Mission:</p>
				<p>{currentMissionSchedule.weeksRequired}</p>
			</div>

			<div className={styles.completeLine}>
				<p>Completion Date:</p>
				<p>
					{!Number.isFinite(currentMissionSchedule.weeksRequired)
						? 'Impossible'
						: formatUTC(currentMissionSchedule.completionDate)}
				</p>
			</div>

			{!isSecondMission && !isThirdMission && SecondQuestSchedule && (
				<>
					<hr className={styles.lineBreak} />

					<div className={styles.line}>
						<p>Second Mission Vestiges Needed:</p>
						<p>{secondQuestOnlyPoints.vestiges}</p>
					</div>

					<div className={styles.line}>
						<p>Second Mission Traces Needed:</p>
						<p>{secondQuestOnlyPoints.traces}</p>
					</div>

					<div className={styles.line}>
						<p>Weeks to Finish Second Mission:</p>
						<p>{SecondQuestSchedule.weeksRequired}</p>
					</div>

					<div className={styles.completeLine}>
						<p>Completion Date:</p>
						<p>
							{!Number.isFinite(SecondQuestSchedule.weeksRequired)
								? 'Impossible'
								: formatUTC(SecondQuestSchedule.completionDate)}
						</p>
					</div>
				</>
			)}
			{!isThirdMission && ThirdQuestSchedule && (
				<>
					<hr className={styles.lineBreak} />

					<div className={styles.line}>
						<p>Third Mission Vestiges Needed:</p>
						<p>{thirdQuestOnlyPoints.vestiges}</p>
					</div>

					<div className={styles.line}>
						<p>Third Mission Traces Needed:</p>
						<p>{thirdQuestOnlyPoints.traces}</p>
					</div>

					<div className={styles.line}>
						<p>Weeks to Finish Third Mission:</p>
						<p>{ThirdQuestSchedule.weeksRequired}</p>
					</div>

					<div className={styles.completeLine}>
						<p>Completion Date:</p>
						<p>
							{!Number.isFinite(ThirdQuestSchedule.weeksRequired)
								? 'Impossible'
								: formatUTC(ThirdQuestSchedule.completionDate)}
						</p>
					</div>
				</>
			)}
		</div>
	);
};

export default AstraSchedule;

'use client';

import { calculatePointsSchedule, formatUTC } from '@/app/liberation/lib/calculateSchedule';

import { getCumulativeLiberationPoints, isFirstDestinyLiberation } from '@data/liberation/liberationQuests';

import styles from './DestinySchedule.module.scss';

import type { WeeklyMonthlyPoints } from '@data/liberation/liberationBosses';
import type { JSX } from 'react';

type Props = {
	selectedDate: Date;
	weeklyMonthlyPoints: WeeklyMonthlyPoints;
	selectedQuest: string | null;
	remainingTotalDetermination: number;
	remainingCurrentDetermination: number;
};

const DestinySchedule = ({
	weeklyMonthlyPoints,
	selectedDate,
	selectedQuest,
	remainingTotalDetermination,
	remainingCurrentDetermination,
}: Props): JSX.Element => {
	const firstLiberationPoints = getCumulativeLiberationPoints('Destiny', 'Kaling', true);
	const secondLiberationPoints = getCumulativeLiberationPoints('Destiny', 'Baldrix', true);
	const isFirstLiberation = isFirstDestinyLiberation(selectedQuest ?? '');

	const currentMissionSchedule = calculatePointsSchedule({
		selectedDate: selectedDate,
		remainingTotalPoints: remainingCurrentDetermination,
		weeklyMonthlyPoints,
	});

	const firstLiberationSchedule = isFirstLiberation
		? calculatePointsSchedule({
				selectedDate,
				remainingTotalPoints: firstLiberationPoints,
				weeklyMonthlyPoints,
			})
		: null;

	const secondLiberationSchedule = calculatePointsSchedule({
		selectedDate: selectedDate,
		remainingTotalPoints: remainingTotalDetermination,
		weeklyMonthlyPoints,
	});

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
				<p>This Week Remaining Determination:</p>
				<p>{weeklyMonthlyPoints.thisWeekPoints}</p>
			</div>

			<div className={styles.line}>
				<p>Weekly Determination:</p>
				<p>{weeklyMonthlyPoints.totalWeeklyPoints}</p>
			</div>

			<hr className={styles.lineBreak} />

			<div className={styles.line}>
				<p>Current Mission Determination Needed:</p>
				<p>{remainingCurrentDetermination > 0 ? remainingCurrentDetermination : 0}</p>
			</div>

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

			{isFirstLiberation && firstLiberationSchedule && (
				<>
					<hr className={styles.lineBreak} />

					<div className={styles.line}>
						<p>First Liberation Determination Needed:</p>
						<p>{firstLiberationPoints}</p>
					</div>

					<div className={styles.line}>
						<p>Weeks to Complete First Liberation:</p>
						<p>{firstLiberationSchedule.weeksRequired}</p>
					</div>

					<div className={styles.completeLine}>
						<p>Completion Date:</p>
						<p>
							{!Number.isFinite(firstLiberationSchedule.weeksRequired)
								? 'Impossible'
								: formatUTC(firstLiberationSchedule.completionDate)}
						</p>
					</div>
				</>
			)}

			<hr className={styles.lineBreak} />

			<div className={styles.line}>
				<p>Second Liberation Determination Needed:</p>
				<p>{secondLiberationPoints}</p>
			</div>

			<div className={styles.line}>
				<p>Weeks to Complete Second Liberation:</p>
				<p>{secondLiberationSchedule.weeksRequired}</p>
			</div>

			<div className={styles.completeLine}>
				<p>Completion Date:</p>
				<p>
					{!Number.isFinite(secondLiberationSchedule.weeksRequired)
						? 'Impossible'
						: formatUTC(secondLiberationSchedule.completionDate)}
				</p>
			</div>
		</div>
	);
};

export default DestinySchedule;

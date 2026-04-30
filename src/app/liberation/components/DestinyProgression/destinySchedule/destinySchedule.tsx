'use client';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { getCumulativeLiberationPoints } from '@data/liberation/liberationQuests';

import styles from './destinySchedule.module.scss';

import type { WeeklyMonthlyPoints } from '@data/liberation/liberationBosses';
import type { Dayjs } from 'dayjs';
import type { JSX } from 'react';

dayjs.extend(utc);

type TraceScheduleResult = {
	weeksRequired: number;
	completionDate: Dayjs;
};

const getNextThursdayUTC = (date: Dayjs): Dayjs => {
	const THURSDAY = 4;

	const cursor = date.startOf('day');
	const diff = (THURSDAY - cursor.day() + 7) % 7;

	return cursor.add(diff === 0 ? 7 : diff, 'day').startOf('day');
};

const getNextMonthStartUTC = (date: Dayjs): Dayjs => date.startOf('month').add(1, 'month');

const calculateTraceSchedule = ({
	selectedDate,
	remainingTotalDetermination,
	weeklyMonthlyPoints,
}: {
	selectedDate: Dayjs;
	remainingTotalDetermination: number;
	weeklyMonthlyPoints: WeeklyMonthlyPoints;
}): TraceScheduleResult => {
	const baseDate = selectedDate.utc().startOf('day');

	if (remainingTotalDetermination <= 0) {
		return { weeksRequired: 0, completionDate: baseDate };
	}

	const thisWeek = weeklyMonthlyPoints.thisWeekPoints;
	const thisMonth = weeklyMonthlyPoints.thisMonthPoints;
	const weekly = weeklyMonthlyPoints.totalWeeklyPoints;
	const monthly = weeklyMonthlyPoints.totalMonthlyPoints;

	if (thisWeek === 0 && thisMonth === 0 && weekly === 0 && monthly === 0) {
		return { weeksRequired: Number.POSITIVE_INFINITY, completionDate: baseDate };
	}

	let accumulated = 0;

	accumulated += thisWeek + thisMonth;

	if (accumulated >= remainingTotalDetermination) {
		return { weeksRequired: 0, completionDate: baseDate };
	}

	let nextWeek = getNextThursdayUTC(baseDate);
	let nextMonth = getNextMonthStartUTC(baseDate);

	let completionDate = baseDate;

	while (accumulated < remainingTotalDetermination) {
		if (nextWeek.isSame(nextMonth)) {
			accumulated += weekly + monthly;
			completionDate = nextWeek;

			nextWeek = getNextThursdayUTC(nextWeek);
			nextMonth = getNextMonthStartUTC(nextMonth);
			continue;
		}

		if (nextWeek.isBefore(nextMonth)) {
			accumulated += weekly;
			completionDate = nextWeek;
			nextWeek = getNextThursdayUTC(nextWeek);
		} else {
			accumulated += monthly;
			completionDate = nextMonth;
			nextMonth = getNextMonthStartUTC(nextMonth);
		}

		if (!Number.isFinite(accumulated)) {
			break;
		}
	}

	const weeksRequired = Math.ceil(completionDate.diff(baseDate, 'day') / 7);

	return { weeksRequired, completionDate };
};

type Props = {
	disableProgress: boolean;
	selectedDate: Dayjs;
	weeklyMonthlyPoints: WeeklyMonthlyPoints;
	selectedQuest: string | null;
	determinationPoints: number;
	remainingTotalDetermination: number;
	remainingCurrentDetermination: number;
};

const formatUTC = (date: Dayjs): string => date.utc().format('MMMM D, YYYY [(UTC)]');

const DestinySchedule = ({
	weeklyMonthlyPoints,
	selectedDate,
	remainingTotalDetermination,
	remainingCurrentDetermination,
}: Props): JSX.Element => {
	const firstLiberationPoints = getCumulativeLiberationPoints('Destiny', 'Kaling', true);
	const secondLiberationPoints = getCumulativeLiberationPoints('Destiny', 'Baldrix', true);

	const normalizedDate = selectedDate.utc().startOf('day');

	const currentMissionSchedule = calculateTraceSchedule({
		selectedDate: normalizedDate,
		remainingTotalDetermination: remainingCurrentDetermination,
		weeklyMonthlyPoints,
	});

	const firstLiberationSchedule = calculateTraceSchedule({
		selectedDate: normalizedDate,
		remainingTotalDetermination: firstLiberationPoints,
		weeklyMonthlyPoints,
	});

	const secondLiberationSchedule = calculateTraceSchedule({
		selectedDate: normalizedDate,
		remainingTotalDetermination: remainingTotalDetermination,
		weeklyMonthlyPoints,
	});

	return (
		<div className={styles.mainDiv}>
			<div className={styles.titleDiv}>
				<p className={styles.title}>Liberation Schedule</p>
			</div>

			<div className={styles.line}>
				<p>Start Date:</p>
				<div>{formatUTC(normalizedDate)}</div>
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

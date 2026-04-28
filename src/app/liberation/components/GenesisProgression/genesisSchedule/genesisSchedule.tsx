'use client';

import { clsx } from 'clsx';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Image from 'next/image';

import Tooltip from '@components/Tooltip/tooltip';

import styles from './genesisSchedule.module.scss';

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
	remainingTotalTraces,
	weeklyMonthlyPoints,
	genesisPass,
}: {
	selectedDate: Dayjs;
	remainingTotalTraces: number;
	weeklyMonthlyPoints: WeeklyMonthlyPoints;
	genesisPass: boolean;
}): TraceScheduleResult => {
	const baseDate = selectedDate.utc().startOf('day');

	if (remainingTotalTraces <= 0) {
		return { weeksRequired: 0, completionDate: baseDate };
	}

	const multiplier = genesisPass ? 3 : 1;

	const thisWeek = weeklyMonthlyPoints.thisWeekPoints * multiplier;
	const thisMonth = weeklyMonthlyPoints.thisMonthPoints * multiplier;
	const weekly = weeklyMonthlyPoints.totalWeeklyPoints * multiplier;
	const monthly = weeklyMonthlyPoints.totalMonthlyPoints * multiplier;

	if (thisWeek === 0 && thisMonth === 0 && weekly === 0 && monthly === 0) {
		return { weeksRequired: Number.POSITIVE_INFINITY, completionDate: baseDate };
	}

	let accumulated = 0;

	accumulated += thisWeek + thisMonth;

	if (accumulated >= remainingTotalTraces) {
		return { weeksRequired: 0, completionDate: baseDate };
	}

	let nextWeek = getNextThursdayUTC(baseDate);
	let nextMonth = getNextMonthStartUTC(baseDate);

	let completionDate = baseDate;

	while (accumulated < remainingTotalTraces) {
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
	remainingTotalTraces: number;
	remainingCurrentTraces: number;
	genesisPass: boolean;
	handleToggleGenesisPass: () => void;
};

const formatUTC = (date: Dayjs): string => date.utc().format('MMMM D, YYYY [(UTC)]');

const GenesisSchedule = ({
	weeklyMonthlyPoints,
	selectedDate,
	remainingTotalTraces,
	remainingCurrentTraces,
	genesisPass,
	handleToggleGenesisPass,
	disableProgress,
}: Props): JSX.Element => {
	const normalizedDate = selectedDate.utc().startOf('day');

	const totalSchedule = calculateTraceSchedule({
		selectedDate: normalizedDate,
		remainingTotalTraces,
		weeklyMonthlyPoints,
		genesisPass,
	});

	const currentMissionSchedule = calculateTraceSchedule({
		selectedDate: normalizedDate,
		remainingTotalTraces: remainingCurrentTraces,
		weeklyMonthlyPoints,
		genesisPass,
	});

	const multiplier = genesisPass ? 3 : 1;
	const weeklyValue = weeklyMonthlyPoints.totalWeeklyPoints * multiplier;

	return (
		<div className={styles.mainDiv}>
			<div className={styles.titleDiv}>
				<p className={styles.title}>Liberation Schedule</p>

				{disableProgress && (
					<Tooltip content="Toggle Genesis Pass.">
						<Image
							className={clsx(styles.genesisPass, { [styles.off]: !genesisPass })}
							alt="Genesis Pass"
							height={48}
							onClick={handleToggleGenesisPass}
							src="/assets/icons/menu/genesisPass.webp"
							width={66}
						/>
					</Tooltip>
				)}
			</div>

			<div className={styles.line}>
				<p>Total Traces Needed:</p>
				<p>{remainingTotalTraces > 0 ? remainingTotalTraces : 0}</p>
			</div>

			<div className={styles.line}>
				<p>Weekly Traces:</p>
				<p>{weeklyValue}</p>
			</div>

			<div className={styles.line}>
				<p>Weeks to Complete:</p>
				<p>{totalSchedule.weeksRequired}</p>
			</div>

			<div className={styles.line}>
				<p>Start Date:</p>
				<div>{formatUTC(normalizedDate)}</div>
			</div>

			<div className={styles.completeLine}>
				<p>Completion Date:</p>
				<p>{!Number.isFinite(totalSchedule.weeksRequired) ? 'Impossible' : formatUTC(totalSchedule.completionDate)}</p>
			</div>

			<hr className={styles.lineBreak} />

			<div className={styles.line}>
				<p>Current Mission Traces Needed:</p>
				<p>{remainingCurrentTraces > 0 ? remainingCurrentTraces : 0}</p>
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
		</div>
	);
};

export default GenesisSchedule;

import { differenceInWeeks } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

import { getNextWeeklyResetDate, getNextMonthFirstDay, getNextMidnight, createUtcDate } from '@utils/time';

import type { WeeklyMonthlyPoints } from '@data/liberation/liberationBosses';

type ScheduleResult = {
	weeksRequired: number;
	completionDate: Date;
};

type CalculatePointsScheduleParams = {
	selectedDate: Date | string;
	remainingTotalPoints: number;
	weeklyMonthlyPoints: WeeklyMonthlyPoints;
	genesisPass?: boolean;
};

const normalizeDate = (value: Date | string): Date => {
	const date = value instanceof Date ? value : new Date(value);

	return createUtcDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

export const formatUTC = (date: Date): string => formatInTimeZone(date, 'UTC', "MMMM d, yyyy '(UTC)'");

export const calculatePointsSchedule = ({
	selectedDate,
	remainingTotalPoints,
	weeklyMonthlyPoints,
	genesisPass = false,
}: CalculatePointsScheduleParams): ScheduleResult => {
	const normalizedDate = normalizeDate(selectedDate);

	if (remainingTotalPoints <= 0) {
		return { weeksRequired: 0, completionDate: normalizedDate };
	}

	const multiplier = genesisPass ? 3 : 1;

	const thisWeek = weeklyMonthlyPoints.thisWeekPoints * multiplier;
	const thisMonth = weeklyMonthlyPoints.thisMonthPoints * multiplier;
	const weekly = weeklyMonthlyPoints.totalWeeklyPoints * multiplier;
	const monthly = weeklyMonthlyPoints.totalMonthlyPoints * multiplier;

	if (thisWeek === 0 && thisMonth === 0 && weekly === 0 && monthly === 0) {
		return { weeksRequired: Number.POSITIVE_INFINITY, completionDate: normalizedDate };
	}

	let accumulated = thisWeek + thisMonth;
	if (accumulated >= remainingTotalPoints) {
		return { weeksRequired: 0, completionDate: normalizedDate };
	}

	let nextWeek = getNextWeeklyResetDate(normalizedDate);
	let nextMonth = getNextMonthFirstDay(normalizedDate);
	let completionDate = normalizedDate;

	while (accumulated < remainingTotalPoints) {
		const nextWeekMs = nextWeek.getTime();
		const nextMonthMs = nextMonth.getTime();

		if (nextWeekMs === nextMonthMs) {
			accumulated += weekly + monthly;
			completionDate = nextWeek;

			nextWeek = getNextWeeklyResetDate(nextWeek);
			nextMonth = getNextMonthFirstDay(nextMonth);
		} else if (nextWeekMs < nextMonthMs) {
			accumulated += weekly;
			completionDate = nextWeek;
			nextWeek = getNextWeeklyResetDate(nextWeek);
		} else {
			accumulated += monthly;
			completionDate = nextMonth;
			nextMonth = getNextMonthFirstDay(nextMonth);
		}

		if (!Number.isFinite(accumulated)) {
			break;
		}
	}

	return { weeksRequired: Math.ceil(differenceInWeeks(completionDate, normalizedDate)), completionDate };
};

type CalculateAstraScheduleParams = {
	selectedDate: Date;
	remainingErion: number;
	remainingBattle: number;
	dailyValues: number;
	weeklyMonthlyPoints: WeeklyMonthlyPoints;
};

export const calculateAstraSchedule = ({
	selectedDate,
	remainingErion,
	remainingBattle,
	dailyValues,
	weeklyMonthlyPoints,
}: CalculateAstraScheduleParams): ScheduleResult => {
	const normalizedDate = normalizeDate(selectedDate);

	if (remainingErion <= 0 && remainingBattle <= 0) {
		return { weeksRequired: 0, completionDate: normalizedDate };
	}

	const { totalWeeklyErion, totalWeeklyBattle, thisWeekErion, thisWeekBattle } = weeklyMonthlyPoints;

	if ((totalWeeklyErion <= 0 && dailyValues <= 0) || totalWeeklyBattle <= 0) {
		return { weeksRequired: Number.POSITIVE_INFINITY, completionDate: normalizedDate };
	}

	let currentDate = normalizedDate;

	let remainingErionRequired = remainingErion;
	let remainingBattleRequired = remainingBattle;

	let weeklyErionGrant = thisWeekErion;
	let weeklyBattleGrant = thisWeekBattle;
	let isFirstWeek = true;

	while (remainingErionRequired > 0 || remainingBattleRequired > 0) {
		if (dailyValues > 0) {
			remainingErionRequired -= dailyValues;

			if (remainingErionRequired <= 0 && remainingBattleRequired <= 0) {
				break;
			}
		}

		currentDate = getNextMidnight(currentDate);

		if (currentDate.getUTCDay() === 4) {
			remainingErionRequired -= weeklyErionGrant;
			remainingBattleRequired -= weeklyBattleGrant;

			if (isFirstWeek) {
				weeklyErionGrant = totalWeeklyErion;
				weeklyBattleGrant = totalWeeklyBattle;
				isFirstWeek = false;
			}
		}
	}
	return { weeksRequired: Math.ceil(differenceInWeeks(currentDate, normalizedDate)), completionDate: currentDate };
};

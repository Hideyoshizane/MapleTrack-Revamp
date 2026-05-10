import { differenceInWeeks, format } from 'date-fns';

import { getNextWeeklyResetDate, getNextMonthFirstDay } from '@utils/time';

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
	return value instanceof Date ? value : new Date(value);
};

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

export const formatUTC = (date: Date): string => format(date, "MMMM d, yyyy '(UTC)'");

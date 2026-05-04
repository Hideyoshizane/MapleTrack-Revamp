import { differenceInWeeks, format } from 'date-fns';

import { getNextWeeklyResetDate, getNextMonthFirstDay } from '@utils/time';

import type { WeeklyMonthlyPoints } from '@data/liberation/liberationBosses';

type ScheduleResult = {
	weeksRequired: number;
	completionDate: Date;
};

export const calculatePointsSchedule = ({
	selectedDate,
	remainingTotalPoints,
	weeklyMonthlyPoints,
	genesisPass = false,
}: {
	selectedDate: Date;
	remainingTotalPoints: number;
	weeklyMonthlyPoints: WeeklyMonthlyPoints;
	genesisPass?: boolean;
}): ScheduleResult => {
	if (remainingTotalPoints <= 0) {
		return { weeksRequired: 0, completionDate: selectedDate };
	}

	const multiplier = genesisPass ? 3 : 1;

	const thisWeek = weeklyMonthlyPoints.thisWeekPoints * multiplier;
	const thisMonth = weeklyMonthlyPoints.thisMonthPoints * multiplier;
	const weekly = weeklyMonthlyPoints.totalWeeklyPoints * multiplier;
	const monthly = weeklyMonthlyPoints.totalMonthlyPoints * multiplier;

	if (thisWeek === 0 && thisMonth === 0 && weekly === 0 && monthly === 0) {
		return { weeksRequired: Number.POSITIVE_INFINITY, completionDate: selectedDate };
	}

	let accumulated = thisWeek + thisMonth;
	if (accumulated >= remainingTotalPoints) {
		return { weeksRequired: 0, completionDate: selectedDate };
	}

	let nextWeek = getNextWeeklyResetDate(selectedDate);
	let nextMonth = getNextMonthFirstDay(selectedDate);
	let completionDate = selectedDate;

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

	const weeksRequired = Math.ceil(differenceInWeeks(completionDate, selectedDate));

	return { weeksRequired, completionDate };
};

export const formatUTC = (date: Date): string => format(date, "MMMM d, yyyy '(UTC)'");

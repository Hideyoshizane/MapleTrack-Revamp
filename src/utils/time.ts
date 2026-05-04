import {
	addDays,
	addMonths,
	addMinutes,
	isAfter,
	isSameDay as isSameDayFn,
	nextDay,
	startOfDay,
	startOfMonth,
	differenceInSeconds,
} from 'date-fns';

export const nowInUtc = (): Date => new Date();

const THURSDAY = 4;

export const getNextMidnight = (date: Date): Date => {
	return startOfDay(addDays(date, 1));
};

export const getNextWeeklyResetDate = (date: Date): Date => {
	return startOfDay(nextDay(date, THURSDAY));
};

export const getNextMonthFirstDay = (date: Date): Date => {
	return startOfMonth(addMonths(date, 1));
};

const hasResetPassed = (nextResetDate: Date): boolean => {
	return isAfter(nowInUtc(), nextResetDate);
};

export const hasDailyResetOccurred = (date: Date | null): boolean => {
	if (!date) {
		return true;
	}
	return hasResetPassed(getNextMidnight(date));
};

export const hasWeeklyResetOccurred = (date: Date | null): boolean => {
	if (!date) {
		return true;
	}

	const nextThursdayReset = startOfDay(nextDay(date, THURSDAY));

	return isAfter(nowInUtc(), nextThursdayReset);
};

export const hasMonthlyResetOccurred = (date: Date | null): boolean => {
	if (!date) {
		return true;
	}
	return hasResetPassed(getNextMonthFirstDay(date));
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
	return isSameDayFn(date1, date2);
};

export const addMinutesToDate = (date: Date, minutes: number): Date => {
	return addMinutes(date, minutes);
};

export type remainingTime = {
	days?: number;
	hours: number;
	minutes: number;
	seconds: number;
};

export const getRemainingTime = (target: Date, now: Date): remainingTime => {
	const totalSeconds = Math.max(0, differenceInSeconds(target, now));

	const days = Math.floor(totalSeconds / 86400);
	const remainingSeconds = totalSeconds % 86400;

	const hours = Math.floor(remainingSeconds / 3600);
	const minutes = Math.floor((remainingSeconds % 3600) / 60);
	const seconds = remainingSeconds % 60;

	return { days, hours, minutes, seconds };
};

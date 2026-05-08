import { addMinutes, differenceInSeconds } from 'date-fns';

export const nowInUtc = (): Date => new Date();

const createUtcDate = (
	year: number,
	month: number,
	day: number,
	hours = 0,
	minutes = 0,
	seconds = 0,
	milliseconds = 0,
): Date => {
	return new Date(Date.UTC(year, month, day, hours, minutes, seconds, milliseconds));
};

const THURSDAY = 4;

export const getNextMidnight = (date: Date): Date => {
	return createUtcDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1);
};

export const getNextWeeklyResetDate = (date: Date): Date => {
	const currentUtcDay = date.getUTCDay();

	const daysUntilThursday = (THURSDAY - currentUtcDay + 7) % 7 || 7;

	return createUtcDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + daysUntilThursday);
};

export const getNextMonthFirstDay = (date: Date): Date => {
	return createUtcDate(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
};

const hasResetPassed = (nextResetDate: Date): boolean => {
	return nowInUtc().getTime() >= nextResetDate.getTime();
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

	return hasResetPassed(getNextWeeklyResetDate(date));
};

export const hasMonthlyResetOccurred = (date: Date | null): boolean => {
	if (!date) {
		return true;
	}

	return hasResetPassed(getNextMonthFirstDay(date));
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
	return (
		date1.getUTCFullYear() === date2.getUTCFullYear() &&
		date1.getUTCMonth() === date2.getUTCMonth() &&
		date1.getUTCDate() === date2.getUTCDate()
	);
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

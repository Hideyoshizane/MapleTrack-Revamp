import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import type { Dayjs } from 'dayjs';

// Extend dayjs with UTC and timezone support
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('UTC');

// Returns current UTC time as a Dayjs instance
export const nowUtc = (): dayjs.Dayjs => dayjs.utc();

// Normalize input into a UTC Dayjs object
export const toUtc = (date: string | Date | Dayjs): Dayjs => {
	try {
		return dayjs.utc(date);
	} catch (error) {
		console.error('Invalid date provided to toUtc():', date, error);
		throw error;
	}
};

// Weekday constants for clarity (0 = Sunday, 1 = Monday, ... 6 = Saturday)
export const WEEKDAYS = { MONDAY: 1, THURSDAY: 4 };

export const getNextResetTime = (date: string | Date | Dayjs, targetWeekday: number): Dayjs => {
	const givenDate = toUtc(date);

	// Calculate how many days until the target weekday
	const daysUntil = (targetWeekday + 7 - givenDate.day()) % 7 || 7;

	// Move to the target weekday and reset to midnight
	return givenDate.add(daysUntil, 'day').startOf('day');
};

// Utility to check if reset has occurred
const hasResetOccurred = (resetTime: Dayjs): boolean => nowUtc().isAfter(resetTime);

export const hasDailyResetOccurred = (date: string | Date | Dayjs): boolean =>
	hasResetOccurred(toUtc(date).add(1, 'day').startOf('day'));

export const hasBossResetOccurred = (date: string | Date | Dayjs): boolean =>
	hasResetOccurred(getNextResetTime(date, WEEKDAYS.THURSDAY));

export const hasWeeklyQuestResetOccurred = (date: string | Date | Dayjs): boolean =>
	hasResetOccurred(getNextResetTime(date, WEEKDAYS.MONDAY));

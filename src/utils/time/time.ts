import dayjs, { Dayjs } from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// Extend dayjs with UTC and timezone support
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('UTC');

// Returns current UTC time as a Dayjs instance
export const nowUtc = (): dayjs.Dayjs => dayjs.utc();

// Normalize input into a UTC Dayjs object
const toUtc = (date: string | Date | Dayjs): Dayjs => {
	try {
		return dayjs.utc(date);
	} catch (error) {
		console.error('Invalid date provided to toUtc():', date, error);
		throw error;
	}
};

// Weekday constants for clarity (0 = Sunday, 1 = Monday, ... 6 = Saturday)
const WEEKDAYS = {
	MONDAY: 1,
	THURSDAY: 4,
} as const;

const getNextResetTime = (date: string | Date | Dayjs, targetWeekday: number): Dayjs => {
	const givenDate = toUtc(date);

	// Calculate how many days until the target weekday
	const daysUntil = (targetWeekday + 7 - givenDate.day()) % 7 || 7;

	// Move to the target weekday and reset to midnight
	return givenDate.add(daysUntil, 'day').startOf('day');
};

export const hasDailyResetOccurred = (date: string | Date | Dayjs): boolean => {
	if (!date) {
		return false;
	}

	const resetTime = toUtc(date).add(1, 'day').startOf('day');
	return nowUtc().isAfter(resetTime);
};

export const hasBossResetOccurred = (date: string | Date | Dayjs): boolean => {
	if (!date) {
		return false;
	}

	const resetTime = getNextResetTime(date, WEEKDAYS.THURSDAY);
	return nowUtc().isAfter(resetTime);
};

export const hasWeeklyQuestResetOccurred = (date: string | Date | Dayjs): boolean => {
	if (!date) {
		return false;
	}

	const resetTime = getNextResetTime(date, WEEKDAYS.MONDAY);
	return nowUtc().isAfter(resetTime);
};

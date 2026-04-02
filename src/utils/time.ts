import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import type { Dayjs } from 'dayjs';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('UTC');

// Returns current UTC time as a Dayjs instance
export const nowInUtc = (): dayjs.Dayjs => dayjs.utc();

// Normalize input into a UTC Dayjs object
export const toUtc = (date: string | Date | Dayjs): Dayjs => {
	const day = dayjs.utc(date);
	if (!day.isValid()) {
		throw new Error(`Invalid date provided to toUtc(): ${date.toLocaleString()}`);
	}

	return day;
};

export enum WEEKDAYS {
	SUNDAY = 0,
	MONDAY = 1,
	TUESDAY = 2,
	WEDNESDAY = 3,
	THURSDAY = 4,
	FRIDAY = 5,
	SATURDAY = 6,
}

export const getNextResetTime = (date: string | Date | Dayjs, targetWeekday: number): Dayjs => {
	const givenDate = toUtc(date);

	// Calculate how many days until the target weekday
	const daysUntilReset = (targetWeekday + 7 - givenDate.day()) % 7 || 7;

	// Move to the target weekday and reset to midnight
	return givenDate.add(daysUntilReset, 'day').startOf('day');
};

const hasResetOccurred = (resetTime: Dayjs): boolean => nowInUtc().isAfter(resetTime);

export const hasDailyResetOccurred = (date: string | Date | Dayjs | null | undefined): boolean => {
	if (!date) {
		return true;
	}

	return hasResetOccurred(toUtc(date).add(1, 'day').startOf('day'));
};

export const hasWeeklyResetOccurred = (date: string | Date | Dayjs | null | undefined): boolean => {
	if (!date) {
		return true;
	}
	return hasResetOccurred(getNextResetTime(date, WEEKDAYS.THURSDAY));
};

import dayjs from 'dayjs';

// Normalizes Dayjs format
export const normalizeDayjsDate = (value: unknown): Date | null => {
	if (value === null || value === undefined) {
		return null;
	}

	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? null : value;
	}

	// Dayjs instance
	if (dayjs.isDayjs(value)) {
		const date = value.toDate();
		return Number.isNaN(date.getTime()) ? null : date;
	}

	return null;
};

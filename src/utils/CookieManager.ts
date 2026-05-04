import { COOKIE_EXPIRES_DAYS, MIN_VALUE_BONUS_COOKIE, MAX_VALUE_BONUS_COOKIE } from '@constants/cookiesConstants';

const daysToSeconds = (days: number): number => days * 24 * 60 * 60;

const getCookie = (key: string): string | undefined => {
	if (typeof document === 'undefined') {
		return undefined;
	}

	const match = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]*)`));

	return match ? decodeURIComponent(match[1]) : undefined;
};

const setCookie = (key: string, value: string, maxAge: number): void => {
	if (typeof document === 'undefined') {
		return;
	}

	document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
};

type StringCookieManager<T extends string> = {
	get: () => T[] | undefined;
	set: (values: T[]) => void;
};

type NumericCookieManager = {
	get: () => number | undefined;
	set: (value: number) => void;
};

// Generic typed cookie helper for enums or fixed option sets.
export const createCookieManager = <T extends string>(
	key: string,
	allowed: readonly T[],
	expiresDays = 60,
): StringCookieManager<T> => {
	return {
		get: (): T[] | undefined => {
			const value = getCookie(key);
			if (!value) {
				return;
			}

			return value
				.split(',')
				.map((value) => value.trim())
				.filter((value): value is T => allowed.includes(value as T));
		},

		set: (values: T[]): void => {
			const invalid = values.filter((value) => !allowed.includes(value));

			if (invalid.length) {
				throw new Error(`Invalid ${key}: "${invalid.join(',')}"`);
			}

			const uniqueValues = Array.from(new Set(values));
			setCookie(key, uniqueValues.join(','), daysToSeconds(expiresDays));
		},
	};
};

export const createNumericCookieManager = (
	key: string,
	min = MIN_VALUE_BONUS_COOKIE,
	max = MAX_VALUE_BONUS_COOKIE,
	expiresDays = COOKIE_EXPIRES_DAYS,
): NumericCookieManager => {
	return {
		get: (): number | undefined => {
			const value = getCookie(key);

			if (!value) {
				return;
			}

			const parsed = Number(value);
			if (Number.isNaN(parsed) || parsed < min || parsed > max) {
				return undefined;
			}

			return parsed;
		},

		set: (value: number): void => {
			if (value < min || value > max) {
				throw new Error(`Invalid ${key}: ${value}. Must be ${min}-${max}.`);
			}

			setCookie(key, String(value), daysToSeconds(expiresDays));
		},
	};
};

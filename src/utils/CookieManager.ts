import Cookies from 'universal-cookie';

import { COOKIE_EXPIRES_DAYS, MIN_VALUE_BONUS_COOKIE, MAX_VALUE_BONUS_COOKIE } from '@constants/cookiesConstants';

const cookies = new Cookies();

const daysToSeconds = (days: number): number => days * 24 * 60 * 60;

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
			const value = cookies.get(key) as string | undefined;
			if (!value) {
				return;
			}

			return value
				.split(',')
				.map((value) => value.trim())
				.filter((value): value is T => allowed.includes(value as T));
		},

		set: (values: T[]): void => {
			const invalid = values.filter((value): boolean => !allowed.includes(value));

			if (invalid.length) {
				throw new Error(`Invalid ${key}: "${invalid.join(',')}"`);
			}

			const uniqueValues = Array.from(new Set(values));
			cookies.set(key, uniqueValues.join(','), { path: '/', maxAge: daysToSeconds(expiresDays) });
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
			const value = cookies.get(key) as string | undefined;

			if (!value) {
				return;
			}

			const numberValue = Number(value);
			if (Number.isNaN(numberValue) || numberValue < min || numberValue > max) {
				return undefined;
			}
			return numberValue;
		},

		set: (value: number): void => {
			if (value < min || value > max) {
				throw new Error(`Invalid ${key}: ${value}. Must be ${min}-${max}.`);
			}

			cookies.set(key, String(value), { path: '/', maxAge: daysToSeconds(expiresDays) });
		},
	};
};

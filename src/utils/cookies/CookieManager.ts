import Cookies from 'js-cookie';

import { COOKIE_EXPIRES_DAYS, MIN_VALUE_BONUS_COOKIE, MAX_VALUE_BONUS_COOKIE } from './constants';

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
	expiresDays = 60
): StringCookieManager<T> => ({
	get: (): T[] | undefined => {
		const value = Cookies.get(key);
		if (!value) return;

		const filtered = value.split(',').filter((v): v is T => allowed.includes(v as T));
		return filtered;
	},

	set: (values: T[]): void => {
		const invalid = values.filter((v): boolean => !allowed.includes(v));
		if (invalid.length) throw new Error(`Invalid ${key}: "${invalid.join(',')}"`);
		Cookies.set(key, values.join(','), { expires: expiresDays });
	},
});

export const createNumericCookieManager = (
	key: string,
	min = MIN_VALUE_BONUS_COOKIE,
	max = MAX_VALUE_BONUS_COOKIE,
	expiresDays = COOKIE_EXPIRES_DAYS
): NumericCookieManager => ({
	get: (): number | undefined => {
		const value = Cookies.get(key);
		if (!value) return;
		const n = Number(value);
		return Number.isNaN(n) || n < min || n > max ? undefined : n;
	},

	set: (value: number): void => {
		if (value < min || value > max) throw new Error(`Invalid ${key}: ${value}. Must be ${min}-${max}.`);
		Cookies.set(key, String(value), { expires: expiresDays });
	},
});

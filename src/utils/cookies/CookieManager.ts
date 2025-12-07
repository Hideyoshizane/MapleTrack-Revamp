import Cookies from 'universal-cookie';

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
): StringCookieManager<T> => {
	const cookies = new Cookies();

	return {
		get: (): T[] | undefined => {
			const value = cookies.get(key) as string | undefined;
			if (!value) return;

			const filtered = value.split(',').filter((v): v is T => allowed.includes(v as T));
			return filtered;
		},

		set: (values: T[]): void => {
			const invalid = values.filter((v): boolean => !allowed.includes(v));
			if (invalid.length) throw new Error(`Invalid ${key}: "${invalid.join(',')}"`);

			cookies.set(key, values.join(','), { path: '/', maxAge: expiresDays * 24 * 60 * 60 });
		},
	};
};

export const createNumericCookieManager = (
	key: string,
	min = MIN_VALUE_BONUS_COOKIE,
	max = MAX_VALUE_BONUS_COOKIE,
	expiresDays = COOKIE_EXPIRES_DAYS
): NumericCookieManager => {
	const cookies = new Cookies();

	return {
		get: (): number | undefined => {
			const value = cookies.get(key) as string | undefined;
			if (!value) return;

			const n = Number(value);
			return Number.isNaN(n) || n < min || n > max ? undefined : n;
		},

		set: (value: number): void => {
			if (value < min || value > max) throw new Error(`Invalid ${key}: ${value}. Must be ${min}-${max}.`);

			cookies.set(key, String(value), { path: '/', maxAge: expiresDays * 24 * 60 * 60 });
		},
	};
};

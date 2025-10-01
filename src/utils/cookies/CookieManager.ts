import Cookies from 'js-cookie';

import { COOKIE_EXPIRES_DAYS, MIN_VALUE_BONUS_COOKIE, MAX_VALUE_BONUS_COOKIE } from './constants';
// Generic typed cookie helper for enums or fixed option sets.
export class CookieManager<T extends string> {
	key: string;
	allowedValues: readonly T[];
	expiresDays: number;

	constructor(key: string, allowedValues: readonly T[], expiresDays = 60) {
		this.key = key;
		this.allowedValues = allowedValues;
		this.expiresDays = expiresDays;
	}

	// Get the cookie value as an array of valid items
	get = (): T[] | undefined => {
		const value = Cookies.get(this.key);
		if (!value) return undefined;

		const values = value.split(',') as T[];
		// Filter to only allowed values
		return values.filter((v): boolean => this.allowedValues.includes(v));
	};

	//  Sets the cookie value if it's valid.
	set = (values: T[]): void => {
		// Validate all values
		const invalid = values.filter((v): boolean => !this.allowedValues.includes(v));
		if (invalid.length > 0) {
			throw new Error(`Invalid value(s) for ${this.key}: "${invalid.join(',')}"`);
		}

		// Store as comma-separated string
		Cookies.set(this.key, values.join(','), { expires: this.expiresDays });
	};
}

export class NumericCookieManager {
	key: string;
	min: number;
	max: number;
	expiresDays: number;

	constructor(
		key: string,
		min = MIN_VALUE_BONUS_COOKIE,
		max = MAX_VALUE_BONUS_COOKIE,
		expiresDays = COOKIE_EXPIRES_DAYS
	) {
		this.key = key;
		this.min = min;
		this.max = max;
		this.expiresDays = expiresDays;
	}

	// Get the cookie value as a number if valid, otherwise undefined
	get = (): number | undefined => {
		const value = Cookies.get(this.key);
		if (!value) return undefined;

		const parsed = Number(value);
		if (Number.isNaN(parsed)) return undefined;

		// Validate range
		if (parsed < this.min || parsed > this.max) return undefined;

		return parsed;
	};

	// Set the cookie value if valid
	set = (value: number): void => {
		if (value < this.min || value > this.max) {
			throw new Error(`Invalid value for ${this.key}: ${value}. Must be between ${this.min} and ${this.max}.`);
		}

		Cookies.set(this.key, String(value), { expires: this.expiresDays });
	};
}

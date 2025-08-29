import Cookies from 'js-cookie';

// Generic typed cookie helper for enums or fixed option sets.
export class CookieManager<T extends string> {
	private readonly key: string;
	private readonly allowedValues: readonly T[];
	private readonly expiresDays: number;

	constructor(key: string, allowedValues: readonly T[], expiresDays: number = 60) {
		this.key = key;
		this.allowedValues = allowedValues;
		this.expiresDays = expiresDays;
	}

	//  Gets the cookie value if valid.
	get(): T[] | undefined {
		const value = Cookies.get(this.key);
		if (!value) return undefined;

		// Split by comma to support multi-value cookies
		const values = value.split(',') as T[];
		// Filter out any invalid values
		return values.filter((v) => this.allowedValues.includes(v));
	}

	//  Sets the cookie value if it's valid.
	set(values: T[]): void {
		// Validate all values
		const invalid = values.filter((v) => !this.allowedValues.includes(v));
		if (invalid.length > 0) {
			throw new Error(`Invalid value(s) for ${this.key}: "${invalid.join(',')}"`);
		}

		// Store as comma-separated string
		Cookies.set(this.key, values.join(','), { expires: this.expiresDays });
	}
}

export class NumericCookieManager {
	private readonly key: string;
	private readonly min: number;
	private readonly max: number;
	private readonly expiresDays: number;

	constructor(key: string, min = 0, max = 10, expiresDays = 60) {
		this.key = key;
		this.min = min;
		this.max = max;
		this.expiresDays = expiresDays;
	}

	// Get the cookie value as a number if valid, otherwise undefined
	get(): number | undefined {
		const value = Cookies.get(this.key);
		if (!value) return undefined;

		const parsed = Number(value);
		if (Number.isNaN(parsed)) return undefined;

		// Validate range
		if (parsed < this.min || parsed > this.max) return undefined;

		return parsed;
	}

	// Set the cookie value if valid
	set(value: number): void {
		if (value < this.min || value > this.max) {
			throw new Error(`Invalid value for ${this.key}: ${value}. Must be between ${this.min} and ${this.max}.`);
		}

		Cookies.set(this.key, String(value), { expires: this.expiresDays });
	}
}

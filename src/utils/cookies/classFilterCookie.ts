import { COOKIE_EXPIRES_DAYS } from './constants';
import { createCookieManager } from './CookieManager';

const CLASS_FILTER_OPTIONS = ['mage', 'thief', 'warrior', 'bowman', 'pirate', 'bossing'] as const;

export type ClassFilterOption = (typeof CLASS_FILTER_OPTIONS)[number];

export const classFilterCookie = createCookieManager<ClassFilterOption>(
	'classFilter',
	CLASS_FILTER_OPTIONS,
	COOKIE_EXPIRES_DAYS
);

export const classFilterOptions = CLASS_FILTER_OPTIONS;

import { NumericCookieManager } from './CookieManager';

// Define the allowed options for bonus events
export const BONUS_OPTIONS = ['None', 'Active', 'Inactive'] as const;
export type BonusOption = (typeof BONUS_OPTIONS)[number];

// Typed cookie managers for each event
export const arcaneBonusCookie = new NumericCookieManager('ArcaneBonusEvent');
export const sacredBonusCookie = new NumericCookieManager('SacredBonusEvent');

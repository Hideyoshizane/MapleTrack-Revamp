import { createNumericCookieManager } from './CookieManager';

// Define the allowed options for bonus events
export const BONUS_OPTIONS = ['None', 'Active', 'Inactive'] as const;
export type BonusOption = (typeof BONUS_OPTIONS)[number];

// Typed cookie managers for each event
export const arcaneBonusCookie = createNumericCookieManager('ArcaneBonusEvent');
export const sacredBonusCookie = createNumericCookieManager('SacredBonusEvent');

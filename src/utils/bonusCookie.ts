import { createNumericCookieManager } from './CookieManager';

export const BONUS_OPTIONS = ['None', 'Active', 'Inactive'] as const;
export type BonusOption = (typeof BONUS_OPTIONS)[number];

export const arcaneBonusCookie = createNumericCookieManager('ArcaneBonusEvent');
export const sacredBonusCookie = createNumericCookieManager('SacredBonusEvent');

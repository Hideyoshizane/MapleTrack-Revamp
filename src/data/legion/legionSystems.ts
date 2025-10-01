import legionSystemsJson from './legionSystems.json';

import type { LegionBonus } from '@sharedTypes/Legion';

// Typed JSON import
export const Legion: LegionBonus[] = legionSystemsJson as LegionBonus[];

// Get Legion data by name
export const getLegionData = (name: string): LegionBonus | undefined =>
	Legion.find((group): boolean => group.name === name);

import legionSystemsJson from './legionSystems.json';

import type { LegionBonus } from '@sharedTypes/Legion';

const Legion: LegionBonus[] = legionSystemsJson as LegionBonus[];

export const getLegionData = (name: string): LegionBonus | undefined =>
	Legion.find((group): boolean => group.name === name);

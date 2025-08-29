import legionSystemsJson from './legionSystems.json';

import type { LegionBonus } from '@sharedTypes/Legion';

// Cast the imported JSON into the correct type
export const Legion: LegionBonus[] = legionSystemsJson as LegionBonus[];

export function getLegionData(name: string): LegionBonus | undefined {
	return Legion.find((group) => group.name === name);
}

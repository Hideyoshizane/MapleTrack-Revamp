import { createContext } from 'react';

export type BonusContextType = {
	arcaneBonus: number;
	sacredBonus: number;
	setArcaneBonus: (value: number) => void;
	setSacredBonus: (value: number) => void;
};

export const BonusContext = createContext<BonusContextType | undefined>(undefined);

'use client';

import React, { createContext, useState, useEffect } from 'react';

import { arcaneBonusCookie, sacredBonusCookie } from '@utils/cookies/bonusCookie';

import type { ReactNode, JSX } from 'react';

export interface BonusContextType {
	arcaneBonus: number;
	sacredBonus: number;
	setArcaneBonus: (value: number) => void;
	setSacredBonus: (value: number) => void;
}

const BonusContext = createContext<BonusContextType | undefined>(undefined);

interface BonusProviderProps {
	children: ReactNode;
}

export const BonusProvider: React.FC<BonusProviderProps> = ({ children }): JSX.Element => {
	const [arcaneBonus, setArcaneBonusState] = useState<number>(0);
	const [sacredBonus, setSacredBonusState] = useState<number>(0);

	useEffect((): void => {
		const arcane = arcaneBonusCookie.get() ?? 0;
		const sacred = sacredBonusCookie.get() ?? 0;

		setArcaneBonusState(arcane);
		setSacredBonusState(sacred);

		arcaneBonusCookie.set(arcane);
		sacredBonusCookie.set(sacred);
	}, []);

	const setArcaneBonus = (value: number): void => {
		setArcaneBonusState(value);
		arcaneBonusCookie.set(value);
	};

	const setSacredBonus = (value: number): void => {
		setSacredBonusState(value);
		sacredBonusCookie.set(value);
	};

	return (
		<BonusContext.Provider value={{ arcaneBonus, sacredBonus, setArcaneBonus, setSacredBonus }}>
			{children}
		</BonusContext.Provider>
	);
};

export { BonusContext };

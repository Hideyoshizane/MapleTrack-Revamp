'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

import { arcaneBonusCookie, sacredBonusCookie } from '@utils/cookies/bonusCookie';

interface BonusContextType {
	arcaneBonus: number;
	sacredBonus: number;
	setArcaneBonus: (value: number) => void;
	setSacredBonus: (value: number) => void;
}

const BonusContext = createContext<BonusContextType | undefined>(undefined);

interface BonusProviderProps {
	children: ReactNode;
}

export const BonusProvider: React.FC<BonusProviderProps> = ({ children }) => {
	const [arcaneBonus, setArcaneBonusState] = useState<number>(0);
	const [sacredBonus, setSacredBonusState] = useState<number>(0);

	// Initialize state from cookies on mount
	useEffect(() => {
		const arcane = arcaneBonusCookie.get() ?? 0;
		const sacred = sacredBonusCookie.get() ?? 0;

		setArcaneBonusState(arcane);
		setSacredBonusState(sacred);

		// Ensure cookies are set
		arcaneBonusCookie.set(arcane);
		sacredBonusCookie.set(sacred);
	}, []);

	// Functions to update state + cookies
	const setArcaneBonus = (value: number) => {
		setArcaneBonusState(value);
		arcaneBonusCookie.set(value);
	};

	const setSacredBonus = (value: number) => {
		setSacredBonusState(value);
		sacredBonusCookie.set(value);
	};

	return (
		<BonusContext.Provider value={{ arcaneBonus, sacredBonus, setArcaneBonus, setSacredBonus }}>
			{children}
		</BonusContext.Provider>
	);
};

// Custom hook for easier access
export const useBonusContext = (): BonusContextType => {
	const context = useContext(BonusContext);
	if (!context) {
		throw new Error('useBonusContext must be used within a BonusProvider');
	}
	return context;
};

'use client';

import { useEffect, useState } from 'react';

import { arcaneBonusCookie, sacredBonusCookie } from '@utils/bonusCookie';

import { BonusContext } from './BonusContext';

import type { ReactNode, JSX } from 'react';

type BonusProviderProps = {
	children: ReactNode;
};

export const BonusProvider = ({ children }: BonusProviderProps): JSX.Element => {
	const [arcaneBonus, setArcaneBonusState] = useState<number>(0);
	const [sacredBonus, setSacredBonusState] = useState<number>(0);

	useEffect((): void => {
		const arcane = arcaneBonusCookie.get() ?? 0;
		const sacred = sacredBonusCookie.get() ?? 0;

		queueMicrotask(() => {
			setArcaneBonusState(arcane);
			setSacredBonusState(sacred);
		});

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

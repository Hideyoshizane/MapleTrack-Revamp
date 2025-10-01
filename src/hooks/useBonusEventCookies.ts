import { useEffect, useState } from 'react';

import { arcaneBonusCookie, sacredBonusCookie } from '@utils/cookies/bonusCookie';

// Hook to manage ArcaneBonusEvent and SacredBonusEvent cookies safely.
export const useBonusEventCookies = (): {
	arcaneBonus: number;
	sacredBonus: number;
	setArcaneBonusCookie: (value: number) => void;
	setSacredBonusCookie: (value: number) => void;
} => {
	const [arcaneBonus, setArcaneBonus] = useState<number>(0);
	const [sacredBonus, setSacredBonus] = useState<number>(0);

	useEffect((): void => {
		// Arcane
		const arcaneCurrent = arcaneBonusCookie.get();
		const validArcane = arcaneCurrent ?? 0;
		setArcaneBonus(validArcane);
		arcaneBonusCookie.set(validArcane);

		// Sacred
		const sacredCurrent = sacredBonusCookie.get();
		const validSacred = sacredCurrent ?? 0;
		setSacredBonus(validSacred);
		sacredBonusCookie.set(validSacred);
	}, []);

	// Update Arcane cookie + state
	const setArcaneBonusCookie = (value: number): void => {
		setArcaneBonus(value);
		arcaneBonusCookie.set(value);
	};

	// Update Sacred cookie + state
	const setSacredBonusCookie = (value: number): void => {
		setSacredBonus(value);
		sacredBonusCookie.set(value);
	};

	return {
		arcaneBonus,
		sacredBonus,
		setArcaneBonusCookie,
		setSacredBonusCookie,
	};
};

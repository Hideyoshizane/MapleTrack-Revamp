import { useEffect, useState } from 'react';

import { arcaneBonusCookie, sacredBonusCookie } from '@utils/cookies/bonusCookie';

// Hook to manage ArcaneBonusEvent and SacredBonusEvent cookies safely.
export const useBonusEventCookies = () => {
	const [arcaneBonus, setArcaneBonus] = useState<number>(0);
	const [sacredBonus, setSacredBonus] = useState<number>(0);

	useEffect(() => {
		// Arcane
		const arcaneCurrent = arcaneBonusCookie.get();
		const validArcane = arcaneCurrent ?? 0; // fallback to 0
		setArcaneBonus(validArcane);
		arcaneBonusCookie.set(validArcane);

		// Sacred
		const sacredCurrent = sacredBonusCookie.get();
		const validSacred = sacredCurrent ?? 0; // fallback to 0
		setSacredBonus(validSacred);
		sacredBonusCookie.set(validSacred);
	}, []);

	// Update Arcane cookie + state
	const setArcaneBonusCookie = (value: number) => {
		setArcaneBonus(value);
		arcaneBonusCookie.set(value);
	};

	// Update Sacred cookie + state
	const setSacredBonusCookie = (value: number) => {
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

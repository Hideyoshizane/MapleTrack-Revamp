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
		const arcane = arcaneBonusCookie.get() ?? 0;
		setArcaneBonus(arcane);
		arcaneBonusCookie.set(arcane);

		// Sacred
		const sacred = sacredBonusCookie.get() ?? 0;
		setSacredBonus(sacred);
		sacredBonusCookie.set(sacred);
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

import { useContext } from 'react';

import { BonusContext, type BonusContextType } from './bonusContext';

export const useBonusContext = (): BonusContextType => {
	const context = useContext(BonusContext);
	if (!context) {
		throw new Error('useBonusContext must be used within a BonusProvider');
	}
	return context;
};

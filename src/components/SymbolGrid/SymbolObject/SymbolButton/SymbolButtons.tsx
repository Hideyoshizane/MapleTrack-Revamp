'use client';

import React from 'react';

import Button from '@/components/Button/Button';
import { SymbolCategory, computeDailyWeeklyValues } from '@data/symbols/symbolMappings';
import { Symbol, CharacterContent } from '@models/character';

import { useBonusContext } from '../../../../app/[userOrigin]/[server]/[code]/BonusContext';

import styles from './SymbolButtons.module.css';

export interface SymbolButtonsProps {
	type: SymbolCategory;
	symbol: Symbol;
	content: CharacterContent[];
	onValueChange?: (dailyValue: number, weeklyValue: number) => void;
}

const SymbolButtons: React.FC<SymbolButtonsProps> = ({ type, symbol, content, onValueChange }) => {
	const { arcaneBonus, sacredBonus } = useBonusContext();
	// Get the base daily value and weekly value
	const { dailyValue: initialDaily, weeklyValue } = computeDailyWeeklyValues(symbol, content);

	let dailyValue = initialDaily;

	// Add bonus depending on type
	if (type === 'arcane') {
		dailyValue += arcaneBonus;
	} else {
		dailyValue += sacredBonus;
	}

	// Notify parent of current values
	React.useEffect(() => {
		onValueChange?.(dailyValue, weeklyValue);
	}, [dailyValue, weeklyValue, onValueChange]);

	return (
		<div className={styles.buttonLines}>
			<Button className={styles.button} disabled={!content[0]?.checked}>
				{content[0]?.checked ? `Daily: +${dailyValue}` : 'Disabled'}
			</Button>
			<div className={styles.weeklyDiv}>
				{content[1] && (
					<Button className={styles.button} disabled={!content[1]?.checked}>
						{content[1]?.checked ? `Weekly: ${content[1].tries}/${content[1].maxTries}` : 'Disabled'}
					</Button>
				)}
			</div>
		</div>
	);
};

export default SymbolButtons;

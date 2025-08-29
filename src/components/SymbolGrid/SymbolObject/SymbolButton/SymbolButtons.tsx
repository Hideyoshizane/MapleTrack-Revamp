'use client';

import React from 'react';

import Button from '@/components/Button/Button';
import { getSymbolValueByName, SymbolCategory } from '@data/symbols/symbolMappings';
import { CharacterContent } from '@models/character';

import { useBonusContext } from '../../../../app/[userOrigin]/[server]/[code]/BonusContext';

import styles from './SymbolButtons.module.css';

export interface SymbolButtonsProps {
	type: SymbolCategory;
	symbolName: string;
	content: CharacterContent[];
	onValueChange?: (dailyValue: number, weeklyValue: number) => void;
}

const SymbolButtons: React.FC<SymbolButtonsProps> = ({ type, symbolName, content, onValueChange }) => {
	const { arcaneBonus, sacredBonus } = useBonusContext();
	// Get the base daily value
	let dailyValue = content[0]?.checked ? getSymbolValueByName(symbolName) : 0;

	// If there is a third content item, add its value to dailyValue
	if (content[2]) {
		dailyValue += content[2]?.checked ? getSymbolValueByName(content[2].contentType) : 0;
	}

	// Add bonus depending on type
	if (type === 'arcane') {
		dailyValue += arcaneBonus;
	} else {
		dailyValue += sacredBonus;
	}

	// Weekly value from content[1]
	const weeklyValue = content[1]?.checked ? getSymbolValueByName('Weekly') : 0;

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

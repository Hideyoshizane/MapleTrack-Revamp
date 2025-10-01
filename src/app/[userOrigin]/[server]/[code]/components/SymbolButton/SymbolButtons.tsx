'use client';

import dayjs from 'dayjs';
import React, { useEffect, useCallback, useState } from 'react';

import Button from '@components/Button/Button';
import { computeDailyWeeklyValues } from '@data/symbols/symbolMappings';
import { hasDailyResetOccurred, hasWeeklyQuestResetOccurred } from '@utils/time/time';

import { useBonusContext } from '../../useBonusContext';

import styles from './SymbolButtons.module.scss';

import type { SymbolCategory } from '@data/symbols/symbolMappings';
import type { CharacterContent, CharacterSymbol } from '@models/character';
import type { JSX } from 'react';

export interface SymbolButtonsProps {
	type: SymbolCategory;
	symbol: CharacterSymbol;
	content: CharacterContent[];
	onValueChange?: (dailyValue: number, weeklyValue: number) => void;
}

const SymbolButtons = ({ type, symbol, content, onValueChange }: SymbolButtonsProps): JSX.Element => {
	const { arcaneBonus, sacredBonus } = useBonusContext();
	const [isResetDone, setIsResetDone] = useState(true);
	const [isWeeklyDone, setIsWeeklyDone] = useState(true);

	// Get the base daily value and weekly value
	const { dailyValue: initialDaily, weeklyValue } = computeDailyWeeklyValues(symbol, content);
	const dailyValue = initialDaily + (type === 'arcane' ? arcaneBonus : sacredBonus);

	// Compute Daily Button State
	useEffect((): void => {
		const resetDone = content[0]?.date ? hasDailyResetOccurred(dayjs(content[0].date)) : true;
		setIsResetDone(resetDone);
	}, [content]);

	// Compute Weekly Button State
	useEffect((): void => {
		const resetDone = content[1]?.date ? hasWeeklyQuestResetOccurred(dayjs(content[1].date)) : true;
		setIsWeeklyDone(resetDone);
	}, [content]);

	// Notify parent of current values
	useEffect((): void => {
		onValueChange?.(dailyValue, weeklyValue);
	}, [dailyValue, weeklyValue, onValueChange]);

	const handleDailyUpdate = useCallback(async (): Promise<void> => {
		try {
			const bonus = type === 'arcane' ? arcaneBonus : sacredBonus;

			// Compute URL segments here, local to this function
			const pathname = window.location.pathname;
			const segments = pathname.split('/').filter(Boolean);
			const userOrigin = segments[0];
			const server = segments[1];
			const code = segments[2];

			const payload = { symbolName: symbol.name, bonus, userOrigin, server, code };

			const res = await fetch('/api/characters/updateCharacterDaily', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			const data = await res.json();
			if (data.success) {
				// Aqui faz conexão com onValueChange.
			}
			console.log(data);
		} catch (error) {
			console.error('Error updating daily bonus', error);
		}
	}, [type, symbol.name, arcaneBonus, sacredBonus]);

	// Determine button state and label for Daily Button
	const dailyButtonDisabled = !content[0]?.checked || !isResetDone;
	const dailyButtonLabel = !content[0]?.checked ? 'Disabled' : !isResetDone ? 'Daily done!' : `Daily: +${dailyValue}`;

	// Determine button state and label for Weekly Button
	const weeklyButtonDisabled = !content[1]?.checked || (content[1].tries === 0 && !isWeeklyDone);
	const weeklyButtonLabel = !content[1]?.checked
		? 'Disabled'
		: !isWeeklyDone && content[1].tries === 0
		? 'Weekly Done'
		: `Weekly: ${content[1].tries}/${content[1].maxTries}`;

	return (
		<div className={styles.buttonLines}>
			<Button
				className={styles.button}
				disabled={dailyButtonDisabled}
				onClick={(): undefined => void handleDailyUpdate()}>
				{dailyButtonLabel}
			</Button>
			<div className={styles.weeklyDiv}>
				{content[1] && (
					<Button className={styles.button} disabled={weeklyButtonDisabled}>
						{weeklyButtonLabel}
					</Button>
				)}
			</div>
		</div>
	);
};

export default SymbolButtons;

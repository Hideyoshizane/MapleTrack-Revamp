'use client';

import dayjs from 'dayjs';
import { useEffect, useCallback, useState } from 'react';

import { DEFAULT_WEEKLY_TRIES } from '@/data/character/constants';
import Button from '@components/Button/Button';
import { hasDailyResetOccurred, hasWeeklyQuestResetOccurred } from '@utils/time/time';

import styles from './SymbolButtons.module.scss';

import type { CharacterContent, CharacterSymbol } from '@models/character';
import type { JSX } from 'react';

interface SymbolButtonsProps {
	symbol: CharacterSymbol;
	dailyValue: number;
	weeklyValue: number;
	bonus: number;
	content: CharacterContent[];
	onValueChange?: (data: { currentExp: number; currentLevel: number }) => void;
}

interface UpdateCharacterDailyResponse {
	success: boolean;
	message: string;
	data: { currentExp: number; currentLevel: number };
}

const SymbolButtons = ({
	symbol,
	dailyValue,
	weeklyValue,
	bonus,
	content,
	onValueChange,
}: SymbolButtonsProps): JSX.Element => {
	const [isResetDone, setIsResetDone] = useState(true);
	const [isWeeklyDone, setIsWeeklyDone] = useState(true);

	// Compute Daily Button and Weekly Button
	useEffect((): void => {
		setIsResetDone(content[0]?.date ? hasDailyResetOccurred(content[0].date) : true);
		setIsWeeklyDone(content[1]?.date ? hasWeeklyQuestResetOccurred(dayjs(content[1].date)) : true);
	}, [content]);

	const handleDailyUpdate = useCallback(async (): Promise<void> => {
		try {
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

			const data: UpdateCharacterDailyResponse = await res.json();
			if (data.success) {
				onValueChange?.(data.data);
				setIsResetDone(false);
			}
		} catch (error) {
			console.error('Error updating daily bonus', error);
		}
	}, [symbol.name, onValueChange, bonus]);

	// Determine button state and label for Daily Button
	const dailyButtonDisabled = !content[0]?.checked || !isResetDone;
	const dailyButtonLabel = !content[0]?.checked ? 'Disabled' : !isResetDone ? 'Daily done!' : `Daily: +${dailyValue}`;

	// Determine button state and label for Weekly Button
	const weeklyButtonDisabled = !content[1]?.checked || (content[1].tries === 0 && !isWeeklyDone);
	const weeklyButtonLabel = !content[1]?.checked
		? 'Disabled'
		: !isWeeklyDone && content[1].tries === 0
		? 'Weekly Done'
		: `Weekly: ${content[1].tries}/${DEFAULT_WEEKLY_TRIES}`;

	return (
		<div className={styles.buttonLines}>
			<Button className={styles.button} disabled={dailyButtonDisabled} onClick={(): void => void handleDailyUpdate()}>
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

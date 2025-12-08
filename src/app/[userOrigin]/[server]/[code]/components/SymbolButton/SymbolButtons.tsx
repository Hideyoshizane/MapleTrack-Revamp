'use client';

import dayjs from 'dayjs';
import { useEffect, useCallback, useState } from 'react';

import { DEFAULT_WEEKLY_TRIES } from '@/data/character/constants';
import Button from '@components/Button/Button';
import { hasDailyResetOccurred, hasWeeklyResetOccurred } from '@utils/time/time';

import styles from './SymbolButtons.module.scss';

import type { CharacterContent, CharacterSymbol } from '@models/character';
import type { JSX } from 'react';

interface SymbolButtonsProps {
	symbol: CharacterSymbol;
	dailyValue: number;
	bonus: number;
	content: CharacterContent[];
	onValueChange?: (data: { currentExp: number; currentLevel: number }) => void;
	disableAllDaily: boolean;
}

interface UpdateCharacterResponse {
	success: boolean;
	message: string;
	data: { currentExp: number; currentLevel: number };
}

const SymbolButtons = ({
	symbol,
	dailyValue,
	bonus,
	content,
	onValueChange,
	disableAllDaily = false,
}: SymbolButtonsProps): JSX.Element => {
	const [isResetDone, setIsResetDone] = useState(true);
	const [isWeeklyDone, setIsWeeklyDone] = useState(true);
	const [localContent, setLocalContent] = useState(content);

	// Compute Daily Button and Weekly Button
	useEffect((): void => {
		setLocalContent(content);
		setIsResetDone(content[0]?.date ? hasDailyResetOccurred(content[0].date) : true);
		setIsWeeklyDone(content[1]?.date ? hasWeeklyResetOccurred(dayjs(content[1].date)) : true);
	}, [content]);

	const handleDailyUpdate = useCallback(async (): Promise<void> => {
		try {
			// Compute URL segments here, local to this function
			const pathname = window.location.pathname;
			const [userOrigin, server, code] = pathname.split('/').filter(Boolean);

			const payload = { symbolName: symbol.name, bonus, userOrigin, server, code };

			const res = await fetch('/api/characters/updateCharacterDaily', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			const data: UpdateCharacterResponse = await res.json();
			if (data.success) {
				onValueChange?.(data.data);
				setIsResetDone(false);

				setLocalContent((prev): CharacterContent[] => {
					const updated = [...prev];
					if (updated[0]) {
						updated[0].cleared = true;
					}
					return updated;
				});
			}
		} catch (error) {
			console.error('Error updating daily: ', error);
		}
	}, [symbol.name, onValueChange, bonus]);

	const handleWeeklyUpdate = useCallback(async (): Promise<void> => {
		try {
			// Compute URL segments here, local to this function
			const pathname = window.location.pathname;
			const [userOrigin, server, code] = pathname.split('/').filter(Boolean);

			const payload = { symbolName: symbol.name, userOrigin, server, code };

			const res = await fetch('/api/characters/updateCharacterWeekly', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			const data: UpdateCharacterResponse = await res.json();
			if (data.success) {
				onValueChange?.(data.data);
				setLocalContent((prev): CharacterContent[] => {
					const updated = [...prev];
					if (updated[1]) {
						// Decrement tries and clear when zero
						const currentTries =
							typeof updated[1].tries === 'number' && updated[1].tries > 0 ? updated[1].tries : DEFAULT_WEEKLY_TRIES;
						const newTries = Math.max(currentTries - 1, 0);

						updated[1] = {
							...updated[1],
							tries: newTries,
							cleared: newTries === 0,
						};
						if (newTries === 0) {
							setIsWeeklyDone(false);
						}
					}
					return updated;
				});
			}
		} catch (error) {
			console.error('Error updating Weekly: ', error);
		}
	}, [symbol.name, onValueChange]);

	// Determine button state and label for Daily Button
	const dailyButtonDisabled = disableAllDaily || !localContent[0]?.checked || localContent[0]?.cleared || !isResetDone;
	const dailyButtonLabel = disableAllDaily
		? 'Daily done!'
		: !localContent[0]?.checked
		? 'Disabled'
		: !isResetDone
		? 'Daily done!'
		: `Daily: +${dailyValue}`;

	// Determine button state and label for Weekly Button
	const weeklyButtonDisabled =
		!localContent[1]?.checked || localContent[1]?.cleared || (localContent[1].tries === 0 && !isWeeklyDone);

	const weeklyButtonLabel = !localContent[1]?.checked
		? 'Disabled'
		: !isWeeklyDone && localContent[1].tries === 0
		? 'Weekly Done'
		: `Weekly: ${localContent[1].tries}/${DEFAULT_WEEKLY_TRIES}`;

	return (
		<div className={styles.buttonLines}>
			<Button className={styles.button} disabled={dailyButtonDisabled} onClick={(): void => void handleDailyUpdate()}>
				{dailyButtonLabel}
			</Button>
			<div className={styles.weeklyDiv}>
				{localContent[1] && (
					<Button
						className={styles.button}
						disabled={weeklyButtonDisabled}
						onClick={(): void => void handleWeeklyUpdate()}>
						{weeklyButtonLabel}
					</Button>
				)}
			</div>
		</div>
	);
};

export default SymbolButtons;

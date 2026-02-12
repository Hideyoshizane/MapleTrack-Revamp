'use client';

import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import Button from '@components/Button/Button';
import { DEFAULT_WEEKLY_TRIES } from '@data/character/constants';
import { characterQueryKeys } from '@features/character/character.queryKeys';
import { characterApi } from '@features/character/characterApi';
import { hasDailyResetOccurred, hasWeeklyResetOccurred } from '@utils/time';

import styles from './SymbolButtons.module.scss';

import type {
	CharacterDraft as Character,
	CharacterContent,
	CharacterSymbol,
} from '@features/character/characterModel';
import type { JSX } from 'react';

type SymbolButtonsProps = {
	symbol: CharacterSymbol;
	dailyValue: number;
	bonus: number;
	content: CharacterContent[];
	onValueChange?: (data: { currentExp: number; currentLevel: number }) => void;
	disableAllDaily: boolean;
};

const SymbolButtons = ({
	symbol,
	dailyValue,
	bonus,
	content,
	onValueChange,
	disableAllDaily = false,
}: SymbolButtonsProps): JSX.Element => {
	const queryClient = useQueryClient();

	const dailyContent = content[0];
	const weeklyContent = content[1];

	const isDailyResetDone = dailyContent?.date ? hasDailyResetOccurred(dailyContent.date) : true;
	const isWeeklyResetDone = weeklyContent?.date ? hasWeeklyResetOccurred(dayjs(weeklyContent.date)) : true;

	const handleDailyUpdate = async (): Promise<void> => {
		try {
			const [userOrigin, server, code] = window.location.pathname.split('/').filter(Boolean);

			const result = await characterApi.updateCharacterDaily({
				symbolName: symbol.name,
				bonus,
				userOrigin,
				server,
				code,
			});

			if (!result.success || !result.data) {
				return;
			}

			onValueChange?.(result.data);

			queryClient.setQueryData(
				characterQueryKeys.detail(userOrigin, server, code),
				(previousCharacter: Character | undefined): Character | undefined => {
					if (!previousCharacter) {
						return previousCharacter;
					}

					return {
						...previousCharacter,
						symbols: previousCharacter.symbols.map((characterSymbol) =>
							characterSymbol.name !== symbol.name
								? characterSymbol
								: {
										...characterSymbol,
										content: characterSymbol.content.map((characterContent, index) =>
											index === 0
												? {
														...characterContent,
														cleared: true,
														date: new Date(),
												  }
												: characterContent
										),
								  }
						),
					};
				}
			);
		} catch (error) {
			console.error('Error updating daily:', error);
		}
	};

	const handleWeeklyUpdate = async (): Promise<void> => {
		try {
			const [userOrigin, server, code] = window.location.pathname.split('/').filter(Boolean);

			const result = await characterApi.updateCharacterWeekly({
				symbolName: symbol.name,
				userOrigin,
				server,
				code,
			});

			if (!result.success || !result.data) {
				return;
			}

			onValueChange?.(result.data);

			queryClient.setQueryData(
				characterQueryKeys.detail(userOrigin, server, code),
				(previousCharacter: Character | undefined): Character | undefined => {
					if (!previousCharacter) {
						return previousCharacter;
					}

					return {
						...previousCharacter,
						symbols: previousCharacter.symbols.map((characterSymbol) =>
							characterSymbol.name !== symbol.name
								? characterSymbol
								: {
										...characterSymbol,
										content: characterSymbol.content.map((characterContent, index) => {
											if (index !== 1) {
												return characterContent;
											}

											const currentTries =
												typeof characterContent.tries === 'number' && characterContent.tries > 0
													? characterContent.tries
													: DEFAULT_WEEKLY_TRIES;

											const newTries = Math.max(currentTries - 1, 0);

											return {
												...characterContent,
												tries: newTries,
												cleared: newTries === 0,
												date: newTries === 0 ? new Date() : characterContent.date,
											};
										}),
								  }
						),
					};
				}
			);
		} catch (error) {
			console.error('Error updating weekly:', error);
		}
	};

	// Determine button state and label for Daily Button
	const dailyButtonDisabled = disableAllDaily || !dailyContent?.checked || dailyContent?.cleared || !isDailyResetDone;

	const dailyButtonLabel = disableAllDaily
		? 'Daily done!'
		: !dailyContent?.checked
		? 'Disabled'
		: !isDailyResetDone
		? 'Daily done!'
		: `Daily: +${dailyValue}`;

	// Determine button state and label for Weekly Button
	const weeklyButtonDisabled =
		!weeklyContent?.checked || weeklyContent?.cleared || (weeklyContent?.tries === 0 && !isWeeklyResetDone);

	const weeklyButtonLabel = !weeklyContent?.checked
		? 'Disabled'
		: !isWeeklyResetDone && weeklyContent?.tries === 0
		? 'Weekly Done'
		: `Weekly: ${weeklyContent?.tries}/${DEFAULT_WEEKLY_TRIES}`;

	return (
		<div className={styles.buttonLines}>
			<Button className={styles.button} disabled={dailyButtonDisabled} onClick={(): void => void handleDailyUpdate()}>
				{dailyButtonLabel}
			</Button>
			<div className={styles.weeklyDiv}>
				{weeklyContent && (
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

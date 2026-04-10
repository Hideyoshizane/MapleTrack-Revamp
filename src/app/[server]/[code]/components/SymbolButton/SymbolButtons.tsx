'use client';

import { useQueryClient } from '@tanstack/react-query';

import Button from '@components/Button/button';
import { DEFAULT_WEEKLY_TRIES } from '@data/character/constants';
import { getClassNameByCode } from '@data/classes/classes';
import { characterQueryKeys } from '@features/character/character.queryKeys';

import { useUpdateSymbolDaily } from '../../hooks/useUpdateSymbolDaily';
import { useUpdateSymbolWeekly } from '../../hooks/useUpdateSymbolWeekly';

import styles from './symbolButtons.module.scss';

import type {
	getCharacterDataResponseBody,
	getCharacterDataSymbolsResponseBody,
} from '@features/character/schemas/character.response.schema';
import type { JSX } from 'react';

type SymbolButtonsProps = {
	symbol: getCharacterDataSymbolsResponseBody;
	dailyValue: number;
	bonus: number;
	onValueChange?: (data: {
		currentExp: number;
		currentLevel: number;
		dailyCleared?: boolean;
		weeklyTries?: number;
	}) => void;

	disableAllDaily: boolean;
	optimisticDailyCleared?: boolean;
	optimisticWeeklyTries?: number;
};

const SymbolButtons = ({
	symbol,
	dailyValue,
	bonus,
	onValueChange,
	disableAllDaily = false,
	optimisticDailyCleared,
	optimisticWeeklyTries,
}: SymbolButtonsProps): JSX.Element => {
	const queryClient = useQueryClient();

	const { mutateAsync: updateDaily } = useUpdateSymbolDaily();
	const { mutateAsync: updateWeekly } = useUpdateSymbolWeekly();

	const handleDailyUpdate = async (): Promise<void> => {
		try {
			const [server, code] = window.location.pathname.split('/').filter(Boolean);
			const className = getClassNameByCode(code);
			const result = await updateDaily({
				server,
				className: className ?? '',
				id: symbol.id,
				bonus,
			});

			if (!result.success || !result.data) {
				return;
			}

			// Create updated contents array with first content cleared
			const updatedContents = symbol.contents.map((c, index) => (index === 0 ? { ...c, cleared: true } : c));

			onValueChange?.({
				currentExp: result.data.currentExp,
				currentLevel: result.data.currentLevel,
				dailyCleared: true,
			});

			queryClient.setQueryData(
				characterQueryKeys.detail(server, className ?? ''),
				(previousCharacter: getCharacterDataResponseBody | undefined): getCharacterDataResponseBody | undefined => {
					if (!previousCharacter) {
						return previousCharacter;
					}

					const updateCategory = <T extends getCharacterDataResponseBody['symbols']['arcane']>(
						symbols: T,
					): { updated: boolean; symbols: T } => {
						let updated = false;
						const nextSymbols = symbols.map((s) => {
							if (s.id !== result.data?.id) {
								return s;
							}
							updated = true;
							return { ...s, exp: result.data.currentExp, level: result.data.currentLevel, contents: updatedContents };
						}) as T;
						return { updated, symbols: nextSymbols };
					};

					const arcaneResult = updateCategory(previousCharacter.symbols.arcane);
					if (arcaneResult.updated) {
						return { ...previousCharacter, symbols: { ...previousCharacter.symbols, arcane: arcaneResult.symbols } };
					}

					const sacredResult = updateCategory(previousCharacter.symbols.sacred);
					if (sacredResult.updated) {
						return { ...previousCharacter, symbols: { ...previousCharacter.symbols, sacred: sacredResult.symbols } };
					}

					const grandResult = updateCategory(previousCharacter.symbols.grand);
					if (grandResult.updated) {
						return { ...previousCharacter, symbols: { ...previousCharacter.symbols, grand: grandResult.symbols } };
					}

					return previousCharacter;
				},
			);
		} catch (error) {
			console.error('Error updating daily:', error);
		}
	};

	const handleWeeklyUpdate = async (): Promise<void> => {
		try {
			const [server, code] = window.location.pathname.split('/').filter(Boolean);
			const className = getClassNameByCode(code);

			const result = await updateWeekly({ server, className: className ?? '', id: symbol.id });

			if (!result.success || !result.data) {
				return;
			}

			const currentTries: number = optimisticWeeklyTries ?? DEFAULT_WEEKLY_TRIES;
			const newTries: number = Math.max(currentTries - 1, 0);

			const updatedContents = symbol.contents.map((c, index) =>
				index !== 1 ? c : { ...c, tries: newTries, cleared: newTries === 0 },
			);

			onValueChange?.({
				currentExp: result.data.currentExp,
				currentLevel: result.data.currentLevel,
				weeklyTries: newTries,
			});

			queryClient.setQueryData(
				characterQueryKeys.detail(server, className ?? ''),
				(previousCharacter: getCharacterDataResponseBody | undefined): getCharacterDataResponseBody | undefined => {
					if (!previousCharacter) {
						return previousCharacter;
					}

					const updateArcane = <T extends getCharacterDataResponseBody['symbols']['arcane']>(
						symbols: T,
					): {
						updated: boolean;
						symbols: T;
					} => {
						let updated = false;
						const nextSymbols = symbols.map((s) => {
							if (s.id !== result.data?.id) {
								return s;
							}

							updated = true;
							return { ...s, exp: result.data.currentExp, level: result.data.currentLevel, contents: updatedContents };
						}) as T;

						return { updated, symbols: nextSymbols };
					};

					const arcaneResult = updateArcane(previousCharacter.symbols.arcane);
					if (arcaneResult.updated) {
						return { ...previousCharacter, symbols: { ...previousCharacter.symbols, arcane: arcaneResult.symbols } };
					}

					return previousCharacter;
				},
			);
		} catch (error) {
			console.error('Error updating weekly:', error);
		}
	};

	const dailyContent = symbol.contents[0];
	const weeklyContent = symbol.contents[1];

	const isDailyDisabled = !dailyContent?.checked;
	const isDailyDone = disableAllDaily || optimisticDailyCleared;

	const isWeeklyDisabled = !weeklyContent?.checked;
	const isWeeklyDone = optimisticWeeklyTries === 0;

	// Determine button state and label for Daily Button
	const dailyButtonDisabled = isDailyDisabled || isDailyDone;
	const dailyButtonLabel = isDailyDisabled ? 'Disabled' : isDailyDone ? 'Daily done!' : `Daily: +${dailyValue}`;

	// Determine button state and label for Weekly Button
	const weeklyButtonDisabled = isWeeklyDisabled || isWeeklyDone;
	const weeklyButtonLabel = isWeeklyDisabled
		? 'Disabled'
		: isWeeklyDone
			? 'Weekly Done'
			: `Weekly: ${optimisticWeeklyTries}/${DEFAULT_WEEKLY_TRIES}`;

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

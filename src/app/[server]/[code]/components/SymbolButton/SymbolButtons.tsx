'use client';

import Button from '@components/Button/Button';
import { DEFAULT_WEEKLY_TRIES } from '@data/character/constants';

import { useSymbolButtons } from './hooks/useSymbolButtons';
import styles from './SymbolButtons.module.scss';

import type { getCharacterDataSymbolsResponseBody } from '@features/character/schemas/character.response.schema';
import type { JSX } from 'react';

type Props = {
	symbol: getCharacterDataSymbolsResponseBody;
	dailyValue: number;
	bonus: number;
	onValueChange?: (data: {
		currentExp: number;
		currentLevel: number;
		dailyCleared?: boolean;
		weeklyTries?: number;
	}) => void;
	optimisticDailyCleared?: boolean;
	optimisticWeeklyTries?: number;
	isBulkUpdating?: boolean;
};

const SymbolButtons = ({
	symbol,
	dailyValue,
	bonus,
	onValueChange,
	optimisticDailyCleared,
	optimisticWeeklyTries,
	isBulkUpdating = false,
}: Props): JSX.Element => {
	const { handleDailyUpdate, handleWeeklyUpdate, isDailyLoading, isWeeklyLoading } = useSymbolButtons({
		symbol,
		bonus,
		onValueChange,
		optimisticWeeklyTries,
	});

	const dailyContent = symbol.contents.at(0);
	const weeklyContent = symbol.contents.length > 1 ? symbol.contents.at(-1) : undefined;

	const isDailyUpdating = isDailyLoading || isBulkUpdating;
	const isWeeklyUpdating = isWeeklyLoading;

	const isDailyDisabled = !dailyContent?.checked;
	const isDailyDone = optimisticDailyCleared;

	const isWeeklyDisabled = !weeklyContent?.checked;
	const isWeeklyDone = optimisticWeeklyTries === 0;

	const dailyButtonDisabled = isDailyDisabled || isDailyDone;
	const weeklyButtonDisabled = isWeeklyDisabled || isWeeklyDone;

	const dailyShowLoading = isDailyUpdating && !dailyButtonDisabled;

	const dailyButtonLabel = isDailyDisabled
		? 'Disabled'
		: isDailyDone
			? 'Daily done!'
			: isDailyUpdating
				? 'Updating...'
				: `Daily: +${dailyValue}`;

	const weeklyButtonLabel = isWeeklyUpdating
		? 'Updating...'
		: isWeeklyDisabled
			? 'Disabled'
			: isWeeklyDone
				? 'Weekly Done'
				: `Weekly: ${optimisticWeeklyTries}/${DEFAULT_WEEKLY_TRIES}`;

	return (
		<div className={styles.buttonLines}>
			<Button
				className={styles.button}
				disabled={dailyButtonDisabled}
				isLoading={dailyShowLoading}
				loaderBorderWidth={2}
				loaderColor={'#121212'}
				onClick={(): void => void handleDailyUpdate()}
			>
				{dailyButtonLabel}
			</Button>

			<div className={styles.weeklyDiv}>
				{weeklyContent && (
					<Button
						className={styles.button}
						disabled={weeklyButtonDisabled}
						isLoading={isWeeklyLoading}
						loaderBorderWidth={2}
						loaderColor={'#121212'}
						onClick={(): void => void handleWeeklyUpdate()}
					>
						{weeklyButtonLabel}
					</Button>
				)}
			</div>
		</div>
	);
};

export default SymbolButtons;

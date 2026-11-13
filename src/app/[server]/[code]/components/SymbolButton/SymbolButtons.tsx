'use client';

import Button from '@components/Button/Button';

import { useSymbolButtons } from './hooks/useSymbolButtons';
import styles from './SymbolButtons.module.scss';

import type { getCharacterDataSymbolsResponseBody } from '@features/character/schemas/character.response.schema';
import type { JSX } from 'react';

type Props = {
	symbol: getCharacterDataSymbolsResponseBody;
	dailyValue: number;
	weeklyValue: number;
	bonus: number;
	onValueChange?: (data: {
		currentExp: number;
		currentLevel: number;
		dailyCleared?: boolean;
		weeklyCleared?: boolean;
	}) => void;
	optimisticDailyCleared?: boolean;
	optimisticWeeklyCleared?: boolean;
	isBulkUpdating?: boolean;
};

const SymbolButtons = ({
	symbol,
	dailyValue,
	weeklyValue,
	bonus,
	onValueChange,
	optimisticDailyCleared,
	optimisticWeeklyCleared,
	isBulkUpdating = false,
}: Props): JSX.Element => {
	const { handleDailyUpdate, handleWeeklyUpdate, isDailyLoading, isWeeklyLoading } = useSymbolButtons({
		symbol,
		bonus,
		onValueChange,
	});

	const dailyContent = symbol.contents.at(0);
	const weeklyContent = symbol.contents.length > 1 ? symbol.contents.at(-1) : undefined;

	const isDailyUpdating = isDailyLoading || isBulkUpdating;
	const isWeeklyUpdating = isWeeklyLoading;

	const isDailyDisabled = !dailyContent?.checked;
	const isDailyDone = optimisticDailyCleared ?? dailyContent?.cleared ?? false;

	const isWeeklyDisabled = !weeklyContent?.checked;
	const isWeeklyDone = optimisticWeeklyCleared ?? weeklyContent?.cleared ?? false;

	const dailyButtonDisabled = isDailyDisabled || isDailyDone;
	const weeklyButtonDisabled = isWeeklyDisabled || isWeeklyDone;

	const dailyShowLoading = isDailyUpdating && !dailyButtonDisabled;
	const weeklyShowLoading = isWeeklyUpdating && !weeklyButtonDisabled;

	const dailyButtonLabel = isDailyDisabled
		? 'Disabled'
		: isDailyDone
			? 'Daily done!'
			: isDailyUpdating
				? 'Updating...'
				: `Daily: +${dailyValue}`;

	const weeklyButtonLabel = isWeeklyDisabled
		? 'Disabled'
		: isWeeklyDone
			? 'Weekly done!'
			: isWeeklyUpdating
				? 'Updating...'
				: `Weekly: +${weeklyValue}`;

	return (
		<div className={styles.buttonLines}>
			<Button
				className={styles.button}
				disabled={dailyButtonDisabled}
				isLoading={dailyShowLoading}
				loaderBorderWidth={2}
				loaderColor="#121212"
				onClick={(): void => void handleDailyUpdate()}
			>
				{dailyButtonLabel}
			</Button>

			<div className={styles.weeklyDiv}>
				{weeklyContent && (
					<Button
						className={styles.button}
						disabled={weeklyButtonDisabled}
						isLoading={weeklyShowLoading}
						loaderBorderWidth={2}
						loaderColor="#121212"
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

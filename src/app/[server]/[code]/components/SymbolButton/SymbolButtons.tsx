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
	disableAllDaily: boolean;
	optimisticDailyCleared?: boolean;
	optimisticWeeklyTries?: number;
};

const SymbolButtons = ({
	symbol,
	dailyValue,
	bonus,
	onValueChange,
	disableAllDaily,
	optimisticDailyCleared,
	optimisticWeeklyTries,
}: Props): JSX.Element => {
	const { handleDailyUpdate, handleWeeklyUpdate } = useSymbolButtons({
		symbol,
		bonus,
		onValueChange,
		optimisticWeeklyTries,
	});

	const dailyContent = symbol.contents[0];
	const weeklyContent = symbol.contents[1];

	const isDailyDisabled = !dailyContent?.checked;
	const isDailyDone = disableAllDaily || optimisticDailyCleared;

	const isWeeklyDisabled = !weeklyContent?.checked;
	const isWeeklyDone = optimisticWeeklyTries === 0;

	const dailyButtonDisabled = isDailyDisabled || isDailyDone;

	const weeklyButtonDisabled = isWeeklyDisabled || isWeeklyDone;

	const dailyButtonLabel = isDailyDisabled ? 'Disabled' : isDailyDone ? 'Daily done!' : `Daily: +${dailyValue}`;

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

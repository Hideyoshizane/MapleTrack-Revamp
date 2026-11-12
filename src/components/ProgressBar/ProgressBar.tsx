'use client';

import * as ProgressPrimitive from '@radix-ui/react-progress';
import { clsx } from 'clsx';

import styles from './ProgressBar.module.scss';

import type { JSX } from 'react';

export type JobType =
	| 'default'
	| 'mage'
	| 'warrior'
	| 'bowman'
	| 'thief'
	| 'xenon'
	| 'pirate'
	| 'genesis'
	| 'astra_erion'
	| 'astra_battle'
	| 'astra_overall'
	| 'destiny'
	| 'complete';

const jobTypeClassMap: Record<JobType, string> = {
	default: styles.default,
	mage: styles.mage,
	warrior: styles.warrior,
	bowman: styles.bowman,
	thief: styles.thief,
	xenon: styles.xenon,
	pirate: styles.pirate,
	genesis: styles.genesis,
	astra_erion: styles.astraErion,
	astra_battle: styles.astraBattle,
	astra_overall: styles.astraOverall,
	destiny: styles.destiny,
	complete: styles.complete,
};

type Props = {
	value: number;
	maxValue: number;
	jobType: JobType;
	width: number;
	height: number;
	minPercent?: number;
	forceFull?: boolean;
	disabled?: boolean;
};

type IndicatorStyle = React.CSSProperties & { '--progress-value'?: string | number };

const getPercentage = (
	value: number,
	maxValue: number,
	minPercent: number,
	forceFull: boolean,
	disabled: boolean,
): number => {
	if (forceFull) {
		return 100;
	}

	if (maxValue <= 0 || value <= 0 || disabled) {
		return 0;
	}

	const rawPercent = (value / maxValue) * 100;

	return Math.min(Math.max(rawPercent, minPercent), 100);
};

const ProgressBar = ({
	value,
	maxValue,
	jobType,
	width,
	height,
	minPercent = 5.35,
	forceFull = false,
	disabled = false,
}: Props): JSX.Element => {
	const percentage = getPercentage(value, maxValue, minPercent, forceFull, disabled);

	const indicatorStyle: IndicatorStyle = { '--progress-value': percentage };

	return (
		<ProgressPrimitive.Root className={styles.progressRoot} max={100} style={{ width, height }} value={percentage}>
			<ProgressPrimitive.Indicator
				className={clsx(
					styles.progressIndicator,
					jobTypeClassMap[forceFull || value >= maxValue ? 'complete' : jobType],
				)}
				style={indicatorStyle}
			/>
		</ProgressPrimitive.Root>
	);
};

export default ProgressBar;

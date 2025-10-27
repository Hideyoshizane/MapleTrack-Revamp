'use client';

import * as ProgressPrimitive from '@radix-ui/react-progress';
import { clsx } from 'clsx';
import { useMemo } from 'react';

import styles from './ProgressBar.module.scss';

import type { JSX } from 'react';

export type JobType = 'default' | 'mage' | 'warrior' | 'bowman' | 'thief' | 'xenon' | 'pirate' | 'complete';

const jobTypeClassMap: Record<JobType, string> = {
	default: styles.default,
	mage: styles.mage,
	warrior: styles.warrior,
	bowman: styles.bowman,
	thief: styles.thief,
	xenon: styles.xenon,
	pirate: styles.pirate,
	complete: styles.complete,
};

interface ProgressBarProps {
	value: number;
	maxValue: number;
	jobType: JobType;
	width: number;
	height: number;
	forceFull?: boolean;
	disabled?: boolean;
}

type IndicatorStyle = React.CSSProperties & { '--progress-value'?: string | number };

const ProgressBar = ({
	value,
	maxValue,
	jobType,
	width,
	height,
	forceFull = false,
	disabled = false,
}: ProgressBarProps): JSX.Element => {
	const percentage = useMemo((): number => {
		if (forceFull) return 100;
		if (maxValue <= 0 || value === 0 || disabled) return 0;

		const rawPercent = (value / maxValue) * 100;
		return Math.min(Math.max(rawPercent, 5.35), 100);
	}, [value, maxValue, forceFull, disabled]);

	const indicatorStyle: IndicatorStyle = {
		'--progress-value': percentage,
	};

	return (
		<ProgressPrimitive.Root className={styles.progressRoot} value={percentage} max={100} style={{ width, height }}>
			<ProgressPrimitive.Indicator
				className={clsx(
					styles.progressIndicator,
					jobTypeClassMap[forceFull || value >= maxValue ? 'complete' : jobType]
				)}
				style={indicatorStyle}
			/>
		</ProgressPrimitive.Root>
	);
};

export default ProgressBar;

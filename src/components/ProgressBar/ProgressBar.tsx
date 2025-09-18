'use client';

import * as ProgressPrimitive from '@radix-ui/react-progress';
import { clsx } from 'clsx';
import * as React from 'react';

import styles from './ProgressBar.module.css';

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
	jobType: JobType; // required now
	width: number;
	height: number;
	forceFull?: boolean;
}

type IndicatorStyle = React.CSSProperties & { '--progress-value'?: string | number };

const ProgressBar: React.FC<ProgressBarProps> = ({
	value,
	maxValue,
	jobType,
	width = 300,
	height = 32,
	forceFull = false,
}) => {
	const percentage = React.useMemo(() => {
		if (forceFull) return 100;
		if (maxValue <= 0) return 0;
		if (value === 0) return 0;

		const rawPercent = (value / maxValue) * 100;
		return Math.min(Math.max(rawPercent, 5.35), 100);
	}, [value, maxValue, forceFull]);

	// Force 'complete' when fully filled
	const appliedJobType: JobType = value >= maxValue ? 'complete' : jobType;

	const indicatorStyle: IndicatorStyle = {
		'--progress-value': percentage,
	};

	const rootStyle: React.CSSProperties = {
		width: `${width}px`,
		height: `${height}px`,
	};

	return (
		<ProgressPrimitive.Root className={styles.progressRoot} value={percentage} max={100} style={rootStyle}>
			<ProgressPrimitive.Indicator
				className={clsx(styles.progressIndicator, jobTypeClassMap[appliedJobType])}
				style={indicatorStyle}
			/>
		</ProgressPrimitive.Root>
	);
};

export default ProgressBar;

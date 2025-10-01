'use client';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import React, { useEffect, useState, useCallback } from 'react';

import { SkeletonWrapper } from '@components/SkeletonWrapper/SkeletonWrapper';
import { nowUtc, getNextResetTime, toUtc, WEEKDAYS } from '@utils/time/time';

import styles from './Timer.module.scss';

import type { JSX } from 'react';

// Extend dayjs with UTC and Duration plugins for accurate time calculations
dayjs.extend(utc);
dayjs.extend(duration);

// Type definition for the time left
type TimeLeft = {
	days?: number;
	hours: number;
	minutes: number;
	seconds: number;
};

interface TimerProps {
	target: 'daily' | 'weekly'; // Determines which type of reset. Daily = UTC 12AM. Weekly = Thursday UTC 12AM
}

const Timer = ({ target }: TimerProps): JSX.Element => {
	// Calculate time left until next reset
	const calculateTimeLeft = useCallback((): TimeLeft => {
		const now = nowUtc();

		let targetTime: dayjs.Dayjs;

		if (target === 'daily') {
			targetTime = toUtc(now).add(1, 'day').startOf('day');
		} else {
			targetTime = getNextResetTime(now, WEEKDAYS.THURSDAY);
		}

		// Difference between now and the next reset
		const diffMs = targetTime.diff(now);
		const d = dayjs.duration(diffMs);

		// Construct the time left object
		const timeLeft: TimeLeft = {
			hours: d.hours(),
			minutes: d.minutes(),
			seconds: d.seconds(),
		};

		// For weekly reset, also include number of full days remaining
		if (target === 'weekly') {
			timeLeft.days = Math.floor(d.asDays());
		}

		return timeLeft;
	}, [target]);

	const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

	// Update countdown every second
	useEffect((): (() => void) => {
		const interval: ReturnType<typeof setInterval> = setInterval((): void => {
			setTimeLeft(calculateTimeLeft());
		}, 1000);

		const cleanup = (): void => clearInterval(interval);
		return cleanup;
	}, [calculateTimeLeft]);

	// Helper function to pad numbers with leading zeros
	const pad = (num: number): string => num.toString().padStart(2, '0');
	if (!timeLeft) {
		return <SkeletonWrapper width={200} height={58} color="dark" />;
	}

	return (
		<div>
			{/* Display reset type */}
			<h2 className={styles.timer}>{target === 'daily' ? 'Until Daily Reset' : 'Until Weekly Reset'}</h2>

			{/* Format timer string depending on reset type */}
			{/* format: DD:HH:MM:SS*/}
			<h2 className={styles.timer}>
				{target === 'weekly' && timeLeft.days !== undefined
					? `${pad(timeLeft.days)}:${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`
					: `${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`}
			</h2>
		</div>
	);
};
export default Timer;

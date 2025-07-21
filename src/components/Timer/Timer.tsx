'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import duration from 'dayjs/plugin/duration';

import styles from './Timer.module.css';

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

const Timer: React.FC<TimerProps> = ({ target }) => {
	const calculateTimeLeft = useCallback((): TimeLeft => {
		// Get current UTC time
		const now = dayjs.utc();

		let targetTime: dayjs.Dayjs;

		if (target === 'daily') {
			targetTime = now.add(1, 'day').startOf('day');
		} else {
			// Sunday = 0, Thursday = 4
			const currentDay = now.day();

			let daysUntilThursday = (4 - currentDay + 7) % 7;

			// If today is Thursday and we're past midnight, count 7 days ahead
			if (daysUntilThursday === 0 && now.isAfter(now.startOf('day'))) {
				daysUntilThursday = 7;
			}

			targetTime = now.add(daysUntilThursday, 'day').startOf('day');
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

	const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft);

	// Update countdown every second
	useEffect(() => {
		const interval = setInterval(() => {
			setTimeLeft(calculateTimeLeft());
		}, 1000);

		// Cleanup interval on unmount
		return () => clearInterval(interval);
	}, [calculateTimeLeft]);

	// Helper function to pad numbers with leading zeros
	const pad = (num: number) => num.toString().padStart(2, '0');

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

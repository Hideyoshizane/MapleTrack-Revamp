'use client';

import NumberFlow, { NumberFlowGroup } from '@number-flow/react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import { useEffect, useState } from 'react';

import { SkeletonWrapper } from '@components/SkeletonWrapper/SkeletonWrapper';
import { nowInUtc, getNextResetTime, toUtc, WEEKDAYS } from '@utils/time';

import styles from './Timer.module.scss';

import type { JSX } from 'react';

dayjs.extend(utc);
dayjs.extend(duration);

type TimeLeft = {
	days?: number;
	hours: number;
	minutes: number;
	seconds: number;
};

// Determines which type of reset. Daily = UTC 12AM. Weekly = Thursday UTC 12AM
type TimerProps = {
	target: 'daily' | 'weekly';
};

export default function Timer({ target }: TimerProps): JSX.Element {
	const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

	const computeTimeLeft = (resetType: 'daily' | 'weekly'): TimeLeft => {
		const now = nowInUtc();

		const targetTime =
			resetType === 'daily' ? toUtc(now).add(1, 'day').startOf('day') : getNextResetTime(now, WEEKDAYS.THURSDAY);

		const diff = dayjs.duration(targetTime.diff(now));

		return {
			days: resetType === 'weekly' ? Math.floor(diff.asDays()) : undefined,
			hours: diff.hours(),
			minutes: diff.minutes(),
			seconds: diff.seconds(),
		};
	};

	useEffect(() => {
		queueMicrotask(() => {
			setTimeLeft(computeTimeLeft(target));
		});

		const interval = setInterval(() => {
			try {
				setTimeLeft(computeTimeLeft(target));
			} catch (err) {
				console.error('Timer update error:', err);
			}
		}, 1000);

		return (): void => clearInterval(interval);
	}, [target]);

	if (!timeLeft) {
		return <SkeletonWrapper width={200} height={58} color="dark" variant="rounded" />;
	}

	const { days, hours, minutes, seconds } = timeLeft;

	return (
		<div>
			<h2 className={styles.timerText}>{target === 'daily' ? 'Until Daily Reset' : 'Until Weekly Reset'}</h2>

			<div className={styles.timerText}>
				<NumberFlowGroup>
					{days !== undefined && (
						<>
							<NumberFlow value={days} trend={-1} format={{ minimumIntegerDigits: 2 }} />
							<span>:</span>
						</>
					)}
					<NumberFlow value={hours} trend={-1} format={{ minimumIntegerDigits: 2 }} />
					<span>:</span>
					<NumberFlow value={minutes} trend={-1} format={{ minimumIntegerDigits: 2 }} />
					<span>:</span>
					<NumberFlow value={seconds} trend={-1} format={{ minimumIntegerDigits: 2 }} />
				</NumberFlowGroup>
			</div>
		</div>
	);
}

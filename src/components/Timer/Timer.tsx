'use client';

import NumberFlow, { NumberFlowGroup } from '@number-flow/react';
import { useEffect, useState } from 'react';

import { SkeletonWrapper } from '@components/SkeletonWrapper/SkeletonWrapper';
import { nowInUtc, getNextWeeklyResetDate, getNextMidnight, getRemainingTime } from '@utils/time';

import styles from './Timer.module.scss';

import type { remainingTime } from '@utils/time';
import type { JSX } from 'react';

type Props = {
	target: 'daily' | 'weekly';
};
const computeTimeLeft = (resetType: 'daily' | 'weekly'): remainingTime => {
	const now = nowInUtc();

	const targetDate = resetType === 'daily' ? getNextMidnight(now) : getNextWeeklyResetDate(now);

	const remaining = getRemainingTime(targetDate, now);

	return { ...remaining, days: resetType === 'weekly' ? remaining.days : undefined };
};

const Timer = ({ target }: Props): JSX.Element => {
	const [timeLeft, setTimeLeft] = useState<remainingTime | null>(null);

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
		return <SkeletonWrapper color="dark" height={58} variant="rounded" width={200} />;
	}

	const { days, hours, minutes, seconds } = timeLeft;

	return (
		<div>
			<h2 className={styles.timerText}>{target === 'daily' ? 'Until Daily Reset' : 'Until Weekly Reset'}</h2>

			<div className={styles.timerText}>
				<NumberFlowGroup>
					{days !== undefined && (
						<>
							<NumberFlow format={{ minimumIntegerDigits: 2 }} trend={-1} value={days} />
							<span>:</span>
						</>
					)}

					<NumberFlow format={{ minimumIntegerDigits: 2 }} trend={-1} value={hours} />
					<span>:</span>

					<NumberFlow format={{ minimumIntegerDigits: 2 }} trend={-1} value={minutes} />
					<span>:</span>

					<NumberFlow format={{ minimumIntegerDigits: 2 }} trend={-1} value={seconds} />
				</NumberFlowGroup>
			</div>
		</div>
	);
};

export default Timer;

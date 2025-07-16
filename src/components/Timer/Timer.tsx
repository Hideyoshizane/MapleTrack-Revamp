'use client';

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import styles from './Timer.module.css';

dayjs.extend(utc);

type TimeLeft = {
	days?: number;
	hours: number;
	minutes: number;
	seconds: number;
};

interface TimerProps {
	target: 'daily' | 'weekly';
}

const Timer: React.FC<TimerProps> = ({ target }) => {
	const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => {
		return target === 'daily' ? getDailyReset() : getWeeklyReset();
	});

	function getDailyReset(): TimeLeft {
		const now = dayjs.utc();
		const nextMidnight = now.add(1, 'day').startOf('day');
		const diff = nextMidnight.diff(now);

		const hours = Math.floor(diff / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((diff % (1000 * 60)) / 1000);

		return { hours, minutes, seconds };
	}

	function getWeeklyReset(): TimeLeft {
		const now = dayjs.utc();
		const todayDay = now.day();
		let daysUntilThursday = 4 - todayDay;
		if (daysUntilThursday < 0 || (daysUntilThursday === 0 && now.isAfter(now.startOf('day')))) {
			daysUntilThursday += 7;
		}
		const nextThursdayMidnight = now.add(daysUntilThursday, 'day').startOf('day');
		const diff = nextThursdayMidnight.diff(now);

		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((diff % (1000 * 60)) / 1000);

		return { days, hours, minutes, seconds };
	}

	useEffect(() => {
		const interval = setInterval(() => {
			setTimeLeft(target === 'daily' ? getDailyReset() : getWeeklyReset());
		}, 1000);

		return () => clearInterval(interval);
	}, [target]);

	const pad = (num: number) => num.toString().padStart(2, '0');

	return (
		<div>
			<h2 className={styles.timer}>{target === 'daily' ? 'Until Daily Reset' : 'Until Weekly Reset'}</h2>
			<h2 className={styles.timer}>
				{target === 'weekly' && timeLeft.days !== undefined
					? `${pad(timeLeft.days)}:${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`
					: `${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`}
			</h2>
		</div>
	);
};

export default Timer;

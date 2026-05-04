'use client';

import { clsx } from 'clsx';
import Image from 'next/image';

import { calculatePointsSchedule, formatUTC } from '@/app/liberation/lib/calculateSchedule';
import Tooltip from '@components/Tooltip/tooltip';

import styles from './genesisSchedule.module.scss';

import type { WeeklyMonthlyPoints } from '@data/liberation/liberationBosses';
import type { JSX } from 'react';

type Props = {
	disableProgress: boolean;
	selectedDate: Date;
	weeklyMonthlyPoints: WeeklyMonthlyPoints;
	remainingTotalTraces: number;
	remainingCurrentTraces: number;
	genesisPass: boolean;
	handleToggleGenesisPass: () => void;
};

const GenesisSchedule = ({
	weeklyMonthlyPoints,
	selectedDate,
	remainingTotalTraces,
	remainingCurrentTraces,
	genesisPass,
	handleToggleGenesisPass,
	disableProgress,
}: Props): JSX.Element => {
	const totalSchedule = calculatePointsSchedule({
		selectedDate: selectedDate,
		remainingTotalPoints: remainingTotalTraces,
		weeklyMonthlyPoints,
		genesisPass,
	});

	const currentMissionSchedule = calculatePointsSchedule({
		selectedDate: selectedDate,
		remainingTotalPoints: remainingCurrentTraces,
		weeklyMonthlyPoints,
		genesisPass,
	});

	const multiplier = genesisPass ? 3 : 1;
	const weeklyValue = weeklyMonthlyPoints.totalWeeklyPoints * multiplier;

	return (
		<div className={styles.mainDiv}>
			<div className={styles.titleDiv}>
				<p className={styles.title}>Liberation Schedule</p>

				{disableProgress && (
					<Tooltip content="Toggle Genesis Pass.">
						<Image
							className={clsx(styles.genesisPass, { [styles.off]: !genesisPass })}
							alt="Genesis Pass"
							height={48}
							onClick={handleToggleGenesisPass}
							src="/assets/icons/menu/genesisPass.webp"
							width={66}
						/>
					</Tooltip>
				)}
			</div>

			<div className={styles.line}>
				<p>Total Traces Needed:</p>
				<p>{remainingTotalTraces > 0 ? remainingTotalTraces : 0}</p>
			</div>

			<div className={styles.line}>
				<p>Weekly Traces:</p>
				<p>{weeklyValue}</p>
			</div>

			<div className={styles.line}>
				<p>Weeks to Complete:</p>
				<p>{totalSchedule.weeksRequired}</p>
			</div>

			<div className={styles.line}>
				<p>Start Date:</p>
				<div>{formatUTC(selectedDate)}</div>
			</div>

			<div className={styles.completeLine}>
				<p>Completion Date:</p>
				<p>{!Number.isFinite(totalSchedule.weeksRequired) ? 'Impossible' : formatUTC(totalSchedule.completionDate)}</p>
			</div>

			<hr className={styles.lineBreak} />

			<div className={styles.line}>
				<p>Current Mission Traces Needed:</p>
				<p>{remainingCurrentTraces > 0 ? remainingCurrentTraces : 0}</p>
			</div>

			<div className={styles.line}>
				<p>Weeks to Complete Current Mission:</p>
				<p>{currentMissionSchedule.weeksRequired}</p>
			</div>

			<div className={styles.completeLine}>
				<p>Completion Date:</p>
				<p>
					{!Number.isFinite(currentMissionSchedule.weeksRequired)
						? 'Impossible'
						: formatUTC(currentMissionSchedule.completionDate)}
				</p>
			</div>
		</div>
	);
};

export default GenesisSchedule;

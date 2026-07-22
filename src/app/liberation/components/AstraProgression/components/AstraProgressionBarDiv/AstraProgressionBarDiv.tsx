'use client';

import ProgressBar from '@components/ProgressBar/ProgressBar';
import { getAstraTotals } from '@data/liberation/liberationQuests';

import styles from './AstraProgressionBarDiv.module.scss';

import type { JSX } from 'react';

type Props = {
	currentVestiges: number;
	currentTraces: number;

	vestigesQuestPoints: number;
	tracesQuestPoints: number;

	cumulativeTraces: number;
	cumulativeVestiges: number;
};
const roundToTwoDecimals = (value: number): number => Math.round(value * 100) / 100;

const calculateOverallProgress = (
	currentVestiges: number,
	currentTraces: number,
	cumulativeTraces: number,
	cumulativeVestiges: number,
): number => {
	const { totalVestiges, totalTraces } = getAstraTotals();

	const vestigesCompleted = cumulativeVestiges + currentVestiges;
	const tracesCompleted = cumulativeTraces + currentTraces;

	const totalCompleted = vestigesCompleted + tracesCompleted;
	const totalPossible = totalVestiges + totalTraces;

	if (totalPossible <= 0) {
		return 0;
	}

	const rawProgress = (totalCompleted / totalPossible) * 100;
	const roundedProgress = roundToTwoDecimals(rawProgress);

	return Math.min(100, Math.max(0, roundedProgress));
};

const ProgressionBarDiv = ({
	currentVestiges,
	currentTraces,

	vestigesQuestPoints,
	tracesQuestPoints,

	cumulativeTraces,
	cumulativeVestiges,
}: Props): JSX.Element => {
	const overallProgress = calculateOverallProgress(
		currentVestiges,
		currentTraces,
		cumulativeTraces,
		cumulativeVestiges,
	);

	return (
		<div className={styles.progressBar}>
			<div>
				<div className={styles.progressBarText}>
					<p>Current Vestiges of Erion Progress</p>
					<p>
						{currentVestiges}/{vestigesQuestPoints}
					</p>
				</div>
				<ProgressBar
					height={32}
					jobType="astra_erion"
					maxValue={vestigesQuestPoints}
					value={currentVestiges}
					width={1488}
				/>
			</div>

			<div>
				<div className={styles.progressBarText}>
					<p>Traces of Battle Progress</p>
					<p>
						{currentTraces}/{tracesQuestPoints}
					</p>
				</div>
				<ProgressBar
					height={32}
					jobType="astra_battle"
					maxValue={tracesQuestPoints}
					value={currentTraces}
					width={1488}
				/>
			</div>

			<div>
				<div className={styles.progressBarText}>
					<p>Overall Progress</p>
					<p>
						{overallProgress}%/{100}%
					</p>
				</div>
				<ProgressBar height={32} jobType="astra_overall" maxValue={100} value={overallProgress} width={1488} />
			</div>
		</div>
	);
};

export default ProgressionBarDiv;

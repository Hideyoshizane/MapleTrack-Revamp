'use client';

import ProgressBar from '@components/ProgressBar/ProgressBar';

import styles from './ProgressionBarDiv.module.scss';

import type { JobType } from '@components/ProgressBar/ProgressBar';
import type { JSX } from 'react';

type Props = {
	type: JobType;
	currentPoints: number;
	questPoints: number;
	cumulativeTracesPoints: number;
	totalPoints: number;
};

const ProgressionBarDiv = ({
	type,
	currentPoints,
	questPoints,
	cumulativeTracesPoints,
	totalPoints,
}: Props): JSX.Element => {
	return (
		<div className={styles.progressBar}>
			<div>
				<div className={styles.progressBarText}>
					<p>Current Quest Progress</p>
					<p>
						{currentPoints}/{questPoints}
					</p>
				</div>
				<ProgressBar height={32} jobType={type} maxValue={questPoints} value={currentPoints} width={1488} />
			</div>

			<div>
				<div className={styles.progressBarText}>
					<p>Overall Progress</p>
					<p>
						{cumulativeTracesPoints}/{totalPoints}
					</p>
				</div>
				<ProgressBar
					height={32}
					jobType={type}
					maxValue={totalPoints}
					value={cumulativeTracesPoints}
					width={1488}
				/>
			</div>
		</div>
	);
};

export default ProgressionBarDiv;

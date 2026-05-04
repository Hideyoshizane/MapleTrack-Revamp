'use client';

import { format } from 'date-fns';

import styles from './progressPrevision.module.scss';

import type { JSX, ChangeEvent } from 'react';

type Props = {
	selectedDate: Date;
	onChangeDate: (value: string) => void;
};

const ProgressPrevision = ({ selectedDate, onChangeDate }: Props): JSX.Element => {
	return (
		<div className={styles.progressPrevision}>
			<div className={styles.textDiv}>
				<p className={styles.title}>Progress Prevision</p>
				<p className={styles.subTitle}>Insert the date to start the schedule preview.</p>
			</div>
			<input
				className={styles.date}
				onChange={(event: ChangeEvent<HTMLInputElement>): void => onChangeDate(event.target.value)}
				type="date"
				value={format(selectedDate, 'yyyy-MM-dd')}
			/>
		</div>
	);
};

export default ProgressPrevision;

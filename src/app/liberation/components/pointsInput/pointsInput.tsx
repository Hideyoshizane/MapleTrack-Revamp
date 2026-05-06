'use client';

import { useState, useEffect } from 'react';

import InfoIcon from '@assets/svg/info.svg';
import Tooltip from '@components/Tooltip/Tooltip';

import styles from './PointsInput.module.scss';

import type { ChangeEvent, JSX } from 'react';

type Props = {
	points: number;
	onChangePoints: (value: number) => void;
};
const PointsInput = ({ points, onChangePoints }: Props): JSX.Element => {
	const [inputValue, setInputValue] = useState<string>(String(points));
	const [isDirty, setIsDirty] = useState<boolean>(false);

	useEffect((): void => {
		if (!isDirty) {
			setInputValue(String(points));
		}
	}, [points, isDirty]);

	const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
		const rawValue = event.target.value;
		setInputValue(rawValue);
		setIsDirty(true);
	};

	const handleBlur = (): void => {
		if (inputValue === '') {
			setInputValue(String(points));
			setIsDirty(false);
			return;
		}

		const parsed = Number(inputValue);
		if (!Number.isNaN(parsed) && parsed !== points) {
			onChangePoints(parsed);
		}
		setIsDirty(false);
	};

	return (
		<div className={styles.inputDiv}>
			<input
				className={styles.input}
				id="points"
				min="0"
				name="points"
				onBlur={handleBlur}
				onChange={handleChange}
				placeholder="0"
				step="1"
				type="number"
				value={inputValue}
			/>
			<Tooltip content="Syncs automatically with the Weekly Boss Page." placement="top">
				<InfoIcon className={styles.icon} height={40} width={40} />
			</Tooltip>
		</div>
	);
};

export default PointsInput;

'use client';

import { useState, useEffect } from 'react';

import InfoIcon from '@assets/svg/info.svg';
import Tooltip from '@components/Tooltip/tooltip';

import styles from './pointsInput.module.scss';

import type { ChangeEvent, JSX } from 'react';

type Props = {
	points: number;
	onChangePoints: (value: number) => void;
};
const PointsInput = ({ points, onChangePoints }: Props): JSX.Element => {
	const [inputValue, setInputValue] = useState<string>(String(points));

	useEffect((): void => {
		setInputValue(String(points));
	}, [points]);

	const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
		const rawValue = event.target.value;

		setInputValue(rawValue);
		if (rawValue === '') {
			return;
		}

		const parsed = Number(rawValue);
		if (Number.isNaN(parsed)) {
			return;
		}

		onChangePoints(parsed);
	};

	return (
		<div className={styles.inputDiv}>
			<input
				className={styles.input}
				id="points"
				min="0"
				name="points"
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

'use client';

import Image from 'next/image';
import { useState } from 'react';

import InfoIcon from '@assets/svg/info.svg';
import Tooltip from '@components/Tooltip/Tooltip';
import { weaponQuestsImagesSrc } from '@data/liberation/liberationQuests';

import styles from './PointsInput.module.scss';

import type { ChangeEvent, JSX } from 'react';

type Props = {
	type: string;
	points: number;
	onChangePoints: (value: number) => void;
};

const IMAGE_SIZE = 48;

const PointsInput = ({ type, points, onChangePoints }: Props): JSX.Element => {
	const [inputValue, setInputValue] = useState(String(points));
	const [previousPoints, setPreviousPoints] = useState(points);

	if (points !== previousPoints) {
		setPreviousPoints(points);
		setInputValue(String(points));
	}

	const syncTargetPage = type === 'astra_erion' ? 'Character Track' : 'Weekly Boss';

	const iconSrc = weaponQuestsImagesSrc[type.toLocaleLowerCase()];

	const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
		setInputValue(event.target.value);
	};

	const handleBlur = (): void => {
		if (inputValue === '') {
			setInputValue(String(points));
			return;
		}

		const parsed = Number(inputValue);

		if (!Number.isNaN(parsed) && parsed !== points) {
			onChangePoints(parsed);
		}
	};

	return (
		<div className={styles.inputDiv}>
			<Image alt="Currency icon" height={IMAGE_SIZE} priority src={iconSrc} width={IMAGE_SIZE} />

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

			<Tooltip content={`Syncs automatically with the ${syncTargetPage} page.`} placement="top">
				<InfoIcon className={styles.icon} height={40} width={40} />
			</Tooltip>
		</div>
	);
};

export default PointsInput;

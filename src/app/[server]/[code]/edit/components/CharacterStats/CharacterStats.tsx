'use client';

import ProgressBar from '@components/ProgressBar/progressBar';
import { CHARACTER_MAX_LEVEL } from '@data/character/constants';

import styles from './characterStats.module.scss';

import type { JobType } from '@components/ProgressBar/progressBar';
import type { getEditCharacterDataResponseBody } from '@features/character/schemas/character.response.schema';
import type { JSX } from 'react';

type Props = {
	character?: getEditCharacterDataResponseBody;
	levelInput: string;
	setLevelInput: (value: string) => void;
	targetLevelInput: string;
	setTargetLevelInput: (value: string) => void;
	handleLevelBlur: () => void;
	handleTargetLevelBlur: () => void;
	jobType: JobType;
	level: number;
	targetLevel: number;
};

const CharacterStats = ({
	character,
	levelInput,
	setLevelInput,
	targetLevelInput,
	setTargetLevelInput,
	handleLevelBlur,
	handleTargetLevelBlur,
	jobType,
	level,
	targetLevel,
}: Props): JSX.Element => {
	return (
		<div className={styles.levelDiv}>
			<div className={styles.levelArea}>
				<p className={styles.levelText}>Level:</p>
				<input
					className={styles.levelInput}
					max={CHARACTER_MAX_LEVEL}
					min={0}
					onBlur={handleLevelBlur}
					onChange={(e): void => setLevelInput(e.target.value)}
					placeholder={character?.level?.toString()}
					type="number"
					value={levelInput}
				/>
				<span className={styles.levelSpan}>/</span>
				<input
					className={styles.levelInput}
					max={CHARACTER_MAX_LEVEL}
					min={0}
					onBlur={handleTargetLevelBlur}
					onChange={(e): void => setTargetLevelInput(e.target.value)}
					placeholder={character?.targetLevel?.toString()}
					type="number"
					value={targetLevelInput}
				/>
			</div>

			<ProgressBar height={32} jobType={jobType} maxValue={targetLevel} value={level} width={900} />
		</div>
	);
};

export default CharacterStats;

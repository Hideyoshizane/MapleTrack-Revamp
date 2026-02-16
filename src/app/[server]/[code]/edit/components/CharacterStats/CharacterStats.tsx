'use client';

import ProgressBar from '@components/ProgressBar/ProgressBar';
import { CHARACTER_MAX_LEVEL } from '@data/character/constants';

import styles from './CharacterStats.module.scss';

import type { JobType } from '@components/ProgressBar/ProgressBar';
import type { CharacterDraft as Character } from '@features/character/characterModel';
import type { JSX } from 'react';

type CharacterStatsProps = {
	character?: Character;
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
}: CharacterStatsProps): JSX.Element => {
	return (
		<div className={styles.levelDiv}>
			<div className={styles.levelArea}>
				<p className={styles.levelText}>Level:</p>
				<input
					className={styles.levelInput}
					type="number"
					min={0}
					max={CHARACTER_MAX_LEVEL}
					value={levelInput}
					placeholder={character?.level?.toString()}
					onChange={(e): void => setLevelInput(e.target.value)}
					onBlur={handleLevelBlur}
				/>
				<span className={styles.levelSpan}>/</span>
				<input
					className={styles.levelInput}
					type="number"
					min={0}
					max={CHARACTER_MAX_LEVEL}
					value={targetLevelInput}
					placeholder={character?.targetLevel?.toString()}
					onChange={(e): void => setTargetLevelInput(e.target.value)}
					onBlur={handleTargetLevelBlur}
				/>
			</div>
			{/* Progress bar showing current vs target level */}
			<ProgressBar height={32} width={900} value={level} maxValue={targetLevel} jobType={jobType} />
		</div>
	);
};

export default CharacterStats;

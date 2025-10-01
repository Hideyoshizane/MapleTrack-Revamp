'use client';

import ProgressBar from '@components/ProgressBar/ProgressBar';
import { CHARACTER_MAX_LEVEL } from '@data/character/constants';

import styles from './CharacterStats.module.scss';

import type { JobType } from '@components/ProgressBar/ProgressBar';
import type { Character } from '@sharedTypes/character';
import type { Dispatch, SetStateAction, JSX } from 'react';

interface CharacterStatsProps {
	levelInput: string;
	setLevelInput: Dispatch<SetStateAction<string>>;
	targetLevelInput: string;
	setTargetLevelInput: Dispatch<SetStateAction<string>>;
	character?: Character;
	setCharacter: Dispatch<SetStateAction<Character | undefined>>;
	level: number;
	targetLevel: number;
	jobType: JobType;
}
const CharacterStats = ({
	levelInput,
	setLevelInput,
	targetLevelInput,
	setTargetLevelInput,
	character,
	setCharacter,
	level,
	targetLevel,
	jobType,
}: CharacterStatsProps): JSX.Element => {
	const handleLevelBlur = (): void => {
		setCharacter((prev): Character | undefined => {
			if (!prev) return prev;
			const newLevel = levelInput === '' ? prev.level : Number(levelInput);
			return { ...prev, level: newLevel };
		});
	};

	const handleTargetLevelBlur = (): void => {
		setCharacter((prev): Character | undefined => {
			if (!prev) return prev;
			const newTargetLevel = targetLevelInput === '' ? prev.targetLevel : Number(targetLevelInput);
			return { ...prev, targetLevel: newTargetLevel };
		});
	};

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

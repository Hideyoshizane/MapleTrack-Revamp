'use client';

import Image from 'next/image';
import { useState, useMemo, useCallback } from 'react';

import ProgressBar from '@components/ProgressBar/ProgressBar';
import { getExpForLevel } from '@data/symbols/exp/expTable';
import {
	getSymbolImagePath,
	canUseSymbol,
	getSymbolMaxLevel,
	getSymbolMinLevel,
	calculateDaysToCompleteSymbol,
} from '@data/symbols/symbolMappings';

import SymbolButtons from '../SymbolButton/SymbolButtons';

import styles from './SymbolObject.module.scss';

import type { JobType } from '@components/ProgressBar/ProgressBar';
import type { SymbolCategory, SymbolName } from '@data/symbols/symbolMappings';
import type { CharacterSymbol } from '@models/character';
import type { JSX } from 'react';

export interface SymbolObjectProps {
	type: SymbolCategory;
	symbol: CharacterSymbol;
	characterLevel: number;
	characterJobType: string;
	size?: number;
}

const SymbolObject = ({
	type,
	symbol,
	characterLevel,
	characterJobType,
	size = 24,
}: SymbolObjectProps): JSX.Element => {
	const { name, level, exp, content } = symbol;

	// Track days to level (updated from buttons)
	const [daysToLevel, setDaysToLevel] = useState<number>(0);

	// Check if the character can use this symbol
	const usable = useMemo((): boolean => canUseSymbol(characterLevel, name), [characterLevel, name]);

	//Symbol max Level
	const maxLevel = useMemo((): number => getSymbolMaxLevel(type), [type]);

	// Show MAX if capped, 0 if unusable, otherwise show current level
	const displayLevel = useMemo((): string => (!usable ? 'Level: 0' : `Level: ${level}`), [usable, level]);

	//For progression bar
	const jobType: JobType = level === maxLevel ? 'complete' : (characterJobType as JobType);

	const currentMaxExp = useMemo((): number => getExpForLevel(type, level), [type, level]);

	const [currentExp, setCurrentExp] = useState<number>(exp);

	// Path for the symbol icon
	const src = useMemo((): string => getSymbolImagePath(name as SymbolName), [name]);

	// Callback to update ProgressBar values and days to level
	const handleSymbolChange = useCallback(
		(daily: number, weekly: number): void => {
			// Simulate updated exp accumulation
			const addedExp = daily + weekly;
			setCurrentExp((prev): number => Math.min(prev + addedExp, currentMaxExp));

			// Calculate days to max level
			const days = calculateDaysToCompleteSymbol(daily, weekly, type, level, currentExp);
			setDaysToLevel(days);
		},
		[type, level, currentExp, currentMaxExp]
	);

	return (
		<div className={styles.symbolContainer}>
			<div className={styles.imageContainer}>
				<Image
					src={src}
					width={size}
					height={size}
					alt={`${symbol.name} Icon`}
					className={!usable ? styles.off : ''}
					loading="lazy"
				/>
			</div>
			<div className={styles.symbolInfo}>
				<div className={styles.levelInfo}>
					<p className={styles.symbolLevel}>{displayLevel}</p>
					{usable && (
						<p className={styles.symbolExp}>
							{currentMaxExp === 0 ? 'EXP: MAX' : `EXP: ${currentExp}/${currentMaxExp}`}
						</p>
					)}
				</div>
				<ProgressBar
					height={8}
					width={231}
					value={usable ? currentExp : 0}
					maxValue={currentMaxExp}
					jobType={jobType}
				/>
				{!usable && <p className={styles.unlockLevel}>Unlock at Level {getSymbolMinLevel(name)}</p>}{' '}
				{usable && (
					<>
						<p className={styles.daysTo}>
							Days to level {maxLevel}: {daysToLevel}
						</p>
						<div className={styles.buttonLines}>
							<SymbolButtons type={type} symbol={symbol} content={content} onValueChange={handleSymbolChange} />
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default SymbolObject;

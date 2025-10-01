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
	// Make the variable reactive
	const [daysToLevel, setDaysToLevel] = useState<number>(0);

	// Track current exp and max exp for ProgressBar dynamically
	const [currentExp, setCurrentExp] = useState<number>(symbol.exp);
	const [currentMaxExp, setCurrentMaxExp] = useState<number>(getExpForLevel(type, symbol.level));

	// Check if the character can use this symbol
	const usable = useMemo<boolean>(
		(): boolean => canUseSymbol(characterLevel, symbol.name),
		[characterLevel, symbol.name]
	);

	//Symbol max Level
	const maxLevel = useMemo((): number => getSymbolMaxLevel(type), [type]);

	// Show MAX if capped, 0 if unusable, otherwise show current level
	const displayLevel = useMemo((): string => (!usable ? 'Level: 0' : `Level: ${symbol.level}`), [usable, symbol.level]);

	//For progression bar
	const jobType: JobType = symbol.level === maxLevel ? 'complete' : (characterJobType as JobType);

	// Path for the symbol icon
	const src = useMemo((): string => getSymbolImagePath(symbol.name as SymbolName), [symbol.name]);

	// Callback to update ProgressBar values and days to level
	const handleSymbolChange = useCallback(
		(daily: number, weekly: number): void => {
			// Calculate days to max level
			const days = calculateDaysToCompleteSymbol(daily, weekly, type, symbol.level, currentExp);
			setDaysToLevel(days);

			// Recalculate exp progress based on current level
			const newMaxExp = getExpForLevel(type, symbol.level);
			setCurrentMaxExp(newMaxExp);

			// Simulate updated exp accumulation
			const addedExp = daily + weekly; // adjust this if SymbolButtons returns specific values
			setCurrentExp((prev): number => Math.min(prev + addedExp, newMaxExp));
		},
		[type, symbol.level, currentExp]
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
				{!usable && <p className={styles.unlockLevel}>Unlock at Level {getSymbolMinLevel(symbol.name)}</p>}
				{usable && (
					<p className={styles.daysTo}>
						Days to level {maxLevel}: {daysToLevel}
					</p>
				)}
				{usable && (
					<div className={styles.buttonLines}>
						<SymbolButtons type={type} symbol={symbol} content={symbol.content} onValueChange={handleSymbolChange} />
					</div>
				)}
			</div>
		</div>
	);
};

export default SymbolObject;

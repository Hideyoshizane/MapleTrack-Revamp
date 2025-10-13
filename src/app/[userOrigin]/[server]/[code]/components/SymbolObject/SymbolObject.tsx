'use client';

import Image from 'next/image';
import { useEffect, useState, useMemo, useCallback } from 'react';

import ProgressBar from '@components/ProgressBar/ProgressBar';
import { getExpForLevel } from '@data/symbols/exp/expTable';
import {
	getSymbolImagePath,
	canUseSymbol,
	getSymbolMaxLevel,
	getSymbolMinLevel,
	calculateDaysToCompleteSymbol,
	computeDailyWeeklyValues,
} from '@data/symbols/symbolMappings';

import { useBonusContext } from '../../useBonusContext';
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

	// Exp states
	const [daysToLevel, setDaysToLevel] = useState<number>(0);
	const [currentLevel, setCurrentLevel] = useState<number>(level);
	const [currentExp, setCurrentExp] = useState<number>(exp);

	// Get the base daily value and weekly value for the Buttons
	const { arcaneBonus, sacredBonus } = useBonusContext();
	const { dailyValue: baseDaily, weeklyValue } = computeDailyWeeklyValues(symbol, content);
	const bonus = type === 'arcane' ? arcaneBonus : sacredBonus;
	const dailyValue = baseDaily + bonus;

	// Check if the character can use this symbol
	const usable = useMemo((): boolean => canUseSymbol(characterLevel, name), [characterLevel, name]);

	//Symbol max Level
	const maxLevel = useMemo((): number => getSymbolMaxLevel(type), [type]);

	// Show MAX if capped, 0 if unusable, otherwise show current level
	const displayLevel = useMemo((): string => (!usable ? 'Level: 0' : `Level: ${currentLevel}`), [usable, currentLevel]);

	//For progression bar
	const jobType: JobType = level === maxLevel ? 'complete' : (characterJobType as JobType);
	const forceFull = level === maxLevel;
	const currentMaxExp = useMemo((): number => getExpForLevel(type, level), [type, level]);

	// Path for the symbol icon
	const src = useMemo((): string => getSymbolImagePath(name as SymbolName), [name]);

	// Initial calculation of daysToLevel
	useEffect((): void => {
		setDaysToLevel(calculateDaysToCompleteSymbol(dailyValue, weeklyValue, type, currentLevel, currentExp));
	}, [dailyValue, weeklyValue, type, currentLevel, currentExp]);

	// Handle updates from SymbolButtons
	const handleSymbolChange = useCallback(
		(data: { currentExp: number; currentLevel: number }): void => {
			setCurrentExp(data.currentExp);
			setCurrentLevel(data.currentLevel);
			setDaysToLevel(calculateDaysToCompleteSymbol(dailyValue, weeklyValue, type, data.currentLevel, data.currentExp));
		},
		[dailyValue, weeklyValue, type]
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
					forceFull={forceFull}
				/>
				{!usable && <p className={styles.unlockLevel}>Unlock at Level {getSymbolMinLevel(name)}</p>}{' '}
				{usable && (
					<>
						<p className={styles.daysTo}>
							Days to level {maxLevel}: {daysToLevel}
						</p>
						<div className={styles.buttonLines}>
							<SymbolButtons
								symbol={symbol}
								dailyValue={dailyValue}
								weeklyValue={weeklyValue}
								bonus={bonus}
								content={content}
								onValueChange={handleSymbolChange}
							/>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default SymbolObject;

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
	disableAllDaily: boolean;
}

interface SymbolState {
	currentLevel: number;
	currentExp: number;
	isMaxed: boolean;
	expDisplay: string;
	daysToLevel: number;
}

interface SymbolDerived {
	usable: boolean;
	maxLevel: number;
	currentMaxExp: number;
	displayLevel: string;
	src: string;
}

const SYMBOL_SIZE_DEFAULT = 24;

// Helper to get EXP display
const getExpDisplay = (type: SymbolCategory, level: number, currentExp: number): string => {
	const maxExp = getExpForLevel(type, level);
	return maxExp === 0 ? 'EXP: MAX' : `EXP: ${currentExp}/${maxExp}`;
};

// Helper to check if symbol is maxed
const getIsMaxed = (type: SymbolCategory, level: number): boolean => level === getSymbolMaxLevel(type);

// Helper to calculate full symbol state
const calculateSymbolState = (
	symbol: CharacterSymbol,
	type: SymbolCategory,
	dailyValue: number,
	weeklyValue: number
): SymbolState => {
	const currentLevel = symbol.level;
	const currentExp = symbol.exp;
	const isMaxed = getIsMaxed(type, currentLevel);
	return {
		currentLevel,
		currentExp,
		isMaxed,
		expDisplay: getExpDisplay(type, currentLevel, currentExp),
		daysToLevel: calculateDaysToCompleteSymbol(dailyValue, weeklyValue, type, currentLevel, currentExp),
	};
};

const SymbolObject = ({
	type,
	symbol,
	characterLevel,
	characterJobType,
	size = SYMBOL_SIZE_DEFAULT,
	disableAllDaily,
}: SymbolObjectProps): JSX.Element => {
	const { name, level, exp, content } = symbol;

	// Bonus context
	const { arcaneBonus, sacredBonus } = useBonusContext();

	// Get the base daily value and weekly value for the Buttons
	const { dailyValue: baseDaily, weeklyValue } = computeDailyWeeklyValues(symbol, content);
	const bonus = type === 'arcane' ? arcaneBonus : sacredBonus;
	const dailyValue = baseDaily + bonus;

	// Derived values
	const symbolDerived = useMemo((): SymbolDerived => {
		// Check if the character can use this symbol
		const usable = canUseSymbol(characterLevel, name);

		//Symbol max Level
		const maxLevel = getSymbolMaxLevel(type);

		const currentMaxExp = getExpForLevel(type, level);

		// Show MAX if capped, 0 if unusable, otherwise show current level
		const displayLevel = !usable ? 'Level: 0' : `Level: ${level}`;

		// Path for the symbol icon
		const src = getSymbolImagePath(name as SymbolName);

		return { usable, maxLevel, currentMaxExp, displayLevel, src };
	}, [characterLevel, level, name, type]);

	// States
	const [daysToLevel, setDaysToLevel] = useState<number>(
		calculateDaysToCompleteSymbol(dailyValue, weeklyValue, type, level, exp)
	);

	const [currentExp, setCurrentExp] = useState<number>(exp);
	const [isMaxedSymbol, setIsMaxedSymbol] = useState<boolean>(getIsMaxed(type, level));
	const [forceFull, setForceFull] = useState<boolean>(getIsMaxed(type, level));
	const [expDisplay, setExpDisplay] = useState<string>(getExpDisplay(type, level, exp));

	//For progression bar
	const jobType: JobType = isMaxedSymbol ? 'complete' : (characterJobType as JobType);

	// Handle disableAllDaily updates
	useEffect((): void => {
		if (disableAllDaily) {
			const { currentExp, isMaxed, expDisplay, daysToLevel } = calculateSymbolState(
				symbol,
				type,
				dailyValue,
				weeklyValue
			);

			setCurrentExp(currentExp);
			setIsMaxedSymbol(isMaxed);
			setForceFull(isMaxed);
			setExpDisplay(expDisplay);
			setDaysToLevel(daysToLevel);
		}
	}, [disableAllDaily, symbol, type, dailyValue, weeklyValue]);

	// Handle updates from SymbolButtons
	const handleSymbolChange = useCallback(
		(data: { currentExp: number; currentLevel: number }): void => {
			const maxed = data.currentLevel === symbolDerived.maxLevel;

			setCurrentExp(data.currentExp);
			setDaysToLevel(calculateDaysToCompleteSymbol(dailyValue, weeklyValue, type, data.currentLevel, data.currentExp));
			setIsMaxedSymbol(maxed);
			setForceFull(maxed);
			setExpDisplay(getExpDisplay(type, data.currentLevel, data.currentExp));
		},
		[dailyValue, weeklyValue, type, symbolDerived.maxLevel]
	);

	// Ensure forceFull is false if symbol is unusable
	useEffect((): void => {
		if (!symbolDerived.usable) {
			setForceFull(false);
		}
	}, [symbolDerived.usable]);

	return (
		<div className={styles.symbolContainer}>
			<div className={styles.imageContainer}>
				<Image
					src={symbolDerived.src}
					width={size}
					height={size}
					alt={`${symbol.name} Icon`}
					className={!symbolDerived.usable ? styles.off : ''}
					loading="lazy"
				/>
			</div>
			<div className={styles.symbolInfo}>
				<div className={styles.levelInfo}>
					<p className={styles.symbolLevel}>{symbolDerived.displayLevel}</p>
					{symbolDerived.usable && <p className={styles.symbolExp}>{expDisplay}</p>}
				</div>
				<ProgressBar
					height={8}
					width={231}
					value={symbolDerived.usable ? currentExp : 0}
					maxValue={symbolDerived.currentMaxExp}
					jobType={jobType}
					forceFull={forceFull}
				/>
				{!symbolDerived.usable && <p className={styles.unlockLevel}>Unlock at Level {getSymbolMinLevel(name)}</p>}{' '}
				{symbolDerived.usable && !isMaxedSymbol && (
					<>
						<p className={styles.daysTo}>
							Days to level {symbolDerived.maxLevel}: {daysToLevel}
						</p>
						<div className={styles.buttonLines}>
							<SymbolButtons
								symbol={symbol}
								dailyValue={dailyValue}
								bonus={bonus}
								content={content}
								onValueChange={handleSymbolChange}
								disableAllDaily={disableAllDaily}
							/>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default SymbolObject;

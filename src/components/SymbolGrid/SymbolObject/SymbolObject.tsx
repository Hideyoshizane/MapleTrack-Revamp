'use client';

import Image from 'next/image';
import React, { useState } from 'react';

import ProgressBar, { JobType } from '@components/ProgressBar/ProgressBar';
import { getExpForLevel, getRemainingExp } from '@data/symbols/exp/expTable';
import {
	getSymbolImagePath,
	canUseSymbol,
	SymbolCategory,
	SymbolName,
	getSymbolMaxLevel,
	SymbolMinLevel,
} from '@data/symbols/symbolMappings';
import { Symbol } from '@models/character';

import SymbolButtons from './SymbolButton/SymbolButtons';
import styles from './SymbolObject.module.css';

export interface SymbolObjectProps {
	type: SymbolCategory;
	symbol: Symbol;
	characterLevel: number;
	characterJobType: string;
	size?: number;
}

const someFunctionUsing = (
	daily: number,
	weekly: number,
	type: SymbolCategory,
	symbolLevel: number,
	symbolExp: number
): number => {
	const remaining = getRemainingExp(type, symbolLevel, symbolExp);
	if (remaining <= 0) return 0;
	if (daily <= 0 && weekly <= 0) return Infinity; // cannot progress

	const weeklyTotal = weekly * 3; // total weekly gain
	const dailyGainPerWeek = daily * 7; // total daily gain per week

	const totalExpPerWeek = dailyGainPerWeek + weeklyTotal;

	// calculate full weeks needed
	const weeksNeeded = Math.floor(remaining / totalExpPerWeek);
	let expAfterFullWeeks = remaining - weeksNeeded * totalExpPerWeek;

	// remaining days in last partial week
	let remainingDays = 0;
	while (expAfterFullWeeks > 0) {
		remainingDays++;
		const dayOfWeek = remainingDays % 7;
		// Add daily EXP
		expAfterFullWeeks -= daily;
		// Add weekly EXP on the 7th day
		if (dayOfWeek === 0) {
			expAfterFullWeeks -= weeklyTotal;
		}
	}

	return weeksNeeded * 7 + remainingDays;
};

const SymbolObject: React.FC<SymbolObjectProps> = ({ type, symbol, characterLevel, characterJobType, size = 24 }) => {
	// Make the variable reactive
	const [daysToLevel, setDaysToLevel] = useState<number>(0);

	// Check if the character can use this symbol
	const usable = canUseSymbol(characterLevel, symbol.name);

	//Symbol max Level
	const maxLevel = getSymbolMaxLevel(type);

	//Required exp for this level
	const exp = getExpForLevel(type, symbol.level);

	// Show MAX if capped, 0 if unusable, otherwise show current level
	const displayLevel = !usable ? 'Level: 0' : `Level: ${symbol.level}`;

	//For progression bar
	const jobType: JobType = symbol.level === maxLevel ? 'complete' : ((characterJobType ?? 'default') as JobType);

	// Path for the symbol icon (uses only symbol name now)
	const src = getSymbolImagePath(symbol.name as SymbolName);

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
					{usable && <p className={styles.symbolExp}>{exp === 0 ? 'EXP: MAX' : `EXP: ${symbol.exp}/${exp}`}</p>}
				</div>

				<ProgressBar height={8} width={231} value={usable ? symbol.exp : 0} maxValue={exp} jobType={jobType} />
				{!usable && <p className={styles.unlockLevel}>Unlock at Level {SymbolMinLevel(symbol.name)}</p>}
				{usable && (
					<p className={styles.daysTo}>
						Days to level {maxLevel}: {daysToLevel}
					</p>
				)}
				{usable && (
					<div className={styles.buttonLines}>
						<SymbolButtons
							type={type}
							symbolName={symbol.name}
							content={symbol.content}
							onValueChange={(daily, weekly) => {
								const computedValue = someFunctionUsing(daily, weekly, type, symbol.exp, symbol.level);
								setDaysToLevel(computedValue);
							}}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default SymbolObject;

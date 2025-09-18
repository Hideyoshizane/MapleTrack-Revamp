'use client';

import Image from 'next/image';
import React, { useState } from 'react';

import ProgressBar, { JobType } from '@components/ProgressBar/ProgressBar';
import { getExpForLevel } from '@data/symbols/exp/expTable';
import {
	getSymbolImagePath,
	canUseSymbol,
	SymbolCategory,
	SymbolName,
	getSymbolMaxLevel,
	SymbolMinLevel,
	calculateDaysToCompleteSymbol,
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
							symbol={symbol}
							content={symbol.content}
							onValueChange={(daily, weekly) => {
								const computedValue = calculateDaysToCompleteSymbol(daily, weekly, type, symbol.level, symbol.exp);
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

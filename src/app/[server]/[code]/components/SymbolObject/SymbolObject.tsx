'use client';

import Image from 'next/image';
import { useState } from 'react';

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
import type { CharacterSymbol } from '@features/character/characterModel';
import type { JSX } from 'react';

export type SymbolObjectProps = {
	type: SymbolCategory;
	symbol: CharacterSymbol;
	characterLevel: number;
	characterJobType: string;
	size?: number;
	disableAllDaily: boolean;
};

const SYMBOL_SIZE_DEFAULT = 24;

const getExpDisplay = (type: SymbolCategory, level: number, exp: number): string => {
	const maxExp = getExpForLevel(type, level);
	return maxExp === 0 ? 'EXP: MAX' : `EXP: ${exp}/${maxExp}`;
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

	// Bonuses
	const { arcaneBonus, sacredBonus } = useBonusContext();
	const bonus = type === 'arcane' ? arcaneBonus : sacredBonus;

	const { dailyValue: baseDaily, weeklyValue } = computeDailyWeeklyValues(symbol, content);
	const dailyValue = baseDaily + bonus;

	const [optimisticExp, setOptimisticExp] = useState<number | null>(null);
	const [optimisticLevel, setOptimisticLevel] = useState<number | null>(null);

	const effectiveExp = optimisticExp ?? exp;
	const effectiveLevel = optimisticLevel ?? level;

	const usable = canUseSymbol(characterLevel, name);
	const maxLevel = getSymbolMaxLevel(type);
	const isMaxed = effectiveLevel === maxLevel;

	const src = getSymbolImagePath(name as SymbolName);
	const maxExpForLevel = getExpForLevel(type, effectiveLevel);

	const daysToLevel = calculateDaysToCompleteSymbol(dailyValue, weeklyValue, type, effectiveLevel, effectiveExp);

	const jobType: JobType = isMaxed ? 'complete' : (characterJobType as JobType);

	const handleSymbolChange = (data: { currentExp: number; currentLevel: number }): void => {
		setOptimisticExp(data.currentExp);
		setOptimisticLevel(data.currentLevel);
	};

	return (
		<div className={styles.symbolContainer}>
			<div className={styles.imageContainer}>
				<Image
					src={src}
					width={size}
					height={size}
					alt={`${name} Icon`}
					className={!usable ? styles.off : ''}
					loading="lazy"
				/>
			</div>

			<div className={styles.symbolInfo}>
				<div className={styles.levelInfo}>
					<p className={styles.symbolLevel}>{usable ? `Level: ${effectiveLevel}` : 'Level: 0'}</p>

					{usable && <p className={styles.symbolExp}>{getExpDisplay(type, effectiveLevel, effectiveExp)}</p>}
				</div>

				<ProgressBar
					height={8}
					width={231}
					value={usable ? effectiveExp : 0}
					maxValue={maxExpForLevel}
					jobType={jobType}
					forceFull={isMaxed}
				/>

				{!usable && <p className={styles.unlockLevel}>Unlock at Level {getSymbolMinLevel(name)}</p>}

				{usable && !isMaxed && (
					<>
						<p className={styles.daysTo}>
							Days to level {maxLevel}: {daysToLevel}
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

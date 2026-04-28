'use client';

import Image from 'next/image';
import { useState } from 'react';

import ProgressBar from '@components/ProgressBar/progressBar';
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
import SymbolButtons from '../SymbolButton/symbolButtons';

import styles from './symbolObject.module.scss';

import type { JobType } from '@components/ProgressBar/progressBar';
import type { SymbolName } from '@data/symbols/symbolMappings';
import type { getCharacterDataSymbolsResponseBody } from '@features/character/schemas/character.response.schema';
import type { SymbolCategory, CharacterContent } from '@prisma/client';
import type { JSX } from 'react';

type SymbolObjectProps = {
	type: SymbolCategory;
	symbol: getCharacterDataSymbolsResponseBody;
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
	const { level, exp, contents } = symbol;
	const name = symbol.name as SymbolName;

	// Bonuses
	const { arcaneBonus, sacredBonus } = useBonusContext();
	const bonus = type === 'arcane' ? arcaneBonus : sacredBonus;

	const { dailyValue: baseDaily, weeklyValue } = computeDailyWeeklyValues(
		{ name: symbol.name, level: symbol.level, exp: symbol.exp, category: symbol.category as SymbolCategory },
		contents as CharacterContent[],
	);
	const dailyValue = baseDaily + bonus;

	const [optimisticExp, setOptimisticExp] = useState<number | null>(null);
	const [optimisticLevel, setOptimisticLevel] = useState<number | null>(null);

	const [optimisticDailyCleared, setOptimisticDailyCleared] = useState<boolean | null>(null);
	const [optimisticWeeklyTries, setOptimisticWeeklyTries] = useState<number | null>(null);

	const effectiveExp = optimisticExp ?? exp;
	const effectiveLevel = optimisticLevel ?? level;

	const effectiveDailyCleared = optimisticDailyCleared ?? symbol.contents[0]?.cleared;
	const effectiveWeeklyTries = optimisticWeeklyTries ?? symbol.contents[1]?.tries;

	const usable = canUseSymbol(characterLevel, name);
	const maxLevel = getSymbolMaxLevel(type);
	const isMaxed = effectiveLevel === maxLevel;

	const src = getSymbolImagePath(name);
	const maxExpForLevel = getExpForLevel(type, effectiveLevel);

	const daysToLevel = calculateDaysToCompleteSymbol(dailyValue, weeklyValue, type, effectiveLevel, effectiveExp);

	const jobType: JobType = isMaxed ? 'complete' : (characterJobType as JobType);

	const handleSymbolChange = (data: {
		currentExp: number;
		currentLevel: number;
		dailyCleared?: boolean;
		weeklyTries?: number;
	}): void => {
		setOptimisticExp(data.currentExp);
		setOptimisticLevel(data.currentLevel);

		if (data.dailyCleared !== undefined) {
			setOptimisticDailyCleared(data.dailyCleared);
		}
		if (data.weeklyTries !== undefined) {
			setOptimisticWeeklyTries(data.weeklyTries);
		}
	};
	return (
		<div className={styles.symbolContainer}>
			<div className={styles.imageContainer}>
				<Image
					className={!usable ? styles.off : ''}
					alt={`${name} Icon`}
					height={size}
					loading="lazy"
					src={src}
					width={size}
				/>
			</div>

			<div className={styles.symbolInfo}>
				<div className={styles.levelInfo}>
					<p className={styles.symbolLevel}>{usable ? `Level: ${effectiveLevel}` : 'Level: 0'}</p>

					{usable && <p className={styles.symbolExp}>{getExpDisplay(type, effectiveLevel, effectiveExp)}</p>}
				</div>

				<ProgressBar
					forceFull={isMaxed}
					height={8}
					jobType={jobType}
					maxValue={maxExpForLevel}
					value={usable ? effectiveExp : 0}
					width={231}
				/>

				{!usable && <p className={styles.unlockLevel}>Unlock at Level {getSymbolMinLevel(name)}</p>}

				{usable && !isMaxed && (
					<>
						<p className={styles.daysTo}>
							Days to level {maxLevel}: {daysToLevel}
						</p>

						<div className={styles.buttonLines}>
							<SymbolButtons
								bonus={bonus}
								dailyValue={dailyValue}
								disableAllDaily={disableAllDaily}
								onValueChange={handleSymbolChange}
								optimisticDailyCleared={effectiveDailyCleared}
								optimisticWeeklyTries={effectiveWeeklyTries}
								symbol={symbol}
							/>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default SymbolObject;

'use client';

import { useState } from 'react';

import Image from '@components/Image/Image';
import ProgressBar from '@components/ProgressBar/ProgressBar';
import { getExpForLevel } from '@data/symbols/exp/expTable';
import {
	getSymbolImagePath,
	canUseSymbol,
	getSymbolMaxLevelByCategory,
	getSymbolMinLevel,
	calculateDaysToCompleteSymbol,
	computeDailyWeeklyValues,
} from '@data/symbols/symbolMappings';

import { useBonusContext } from '../../useBonusContext';
import SymbolButtons from '../SymbolButton/SymbolButtons';

import styles from './SymbolObject.module.scss';

import type { JobType } from '@components/ProgressBar/ProgressBar';
import type { getCharacterDataSymbolsResponseBody } from '@features/character/schemas/character.response.schema';
import type { SymbolCategory, CharacterContent } from '@generated/prisma/client';
import type { JSX } from 'react';

const SYMBOL_SIZE_DEFAULT = 24;

type CharacterContentUI = CharacterContent & { type: 'daily' | 'weekly' };

type Props = {
	type: SymbolCategory;
	symbol: getCharacterDataSymbolsResponseBody;
	characterLevel: number;
	characterJobType: string;
	size?: number;
	isBulkUpdating?: boolean;
};

type SymbolValueChange = { currentExp: number; currentLevel: number; dailyCleared?: boolean; weeklyCleared?: boolean };

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
	isBulkUpdating = false,
}: Props): JSX.Element => {
	const { level, exp, name } = symbol;

	const { arcaneBonus, sacredBonus } = useBonusContext();
	const bonus = type === 'arcane' ? arcaneBonus : sacredBonus;

	const { dailyValue: baseDaily, weeklyValue } = computeDailyWeeklyValues(
		{ name, level, exp, category: symbol.category },
		symbol.contents as CharacterContentUI[],
		characterLevel,
	);

	const dailyValue = baseDaily + bonus;

	const [optimisticExp, setOptimisticExp] = useState<number | null>(null);
	const [optimisticLevel, setOptimisticLevel] = useState<number | null>(null);
	const [optimisticDailyCleared, setOptimisticDailyCleared] = useState<boolean | null>(null);
	const [optimisticWeeklyCleared, setOptimisticWeeklyCleared] = useState<boolean | null>(null);

	const effectiveExp = optimisticExp ?? exp;
	const effectiveLevel = optimisticLevel ?? level;

	const effectiveDailyCleared = optimisticDailyCleared ?? symbol.contents[0]?.cleared ?? false;
	const effectiveWeeklyCleared = optimisticWeeklyCleared ?? symbol.contents.at(-1)?.cleared ?? false;

	const usable = canUseSymbol(characterLevel, name);
	const maxLevel = getSymbolMaxLevelByCategory(type);
	const isMaxed = effectiveLevel === maxLevel;

	const src = getSymbolImagePath(name);
	const maxExpForLevel = getExpForLevel(type, effectiveLevel);

	const daysToLevel = calculateDaysToCompleteSymbol(
		dailyValue,
		weeklyValue,
		type,
		effectiveLevel,
		effectiveExp,
		effectiveWeeklyCleared,
		effectiveDailyCleared,
	);

	const jobType: JobType = isMaxed ? 'complete' : (characterJobType as JobType);

	const handleSymbolChange = (data: SymbolValueChange): void => {
		setOptimisticExp(data.currentExp);
		setOptimisticLevel(data.currentLevel);

		if (data.dailyCleared !== undefined) {
			setOptimisticDailyCleared(data.dailyCleared);
		}

		if (data.weeklyCleared !== undefined) {
			setOptimisticWeeklyCleared(data.weeklyCleared);
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
						{daysToLevel !== Infinity && (
							<p className={styles.daysTo}>
								Days to level {maxLevel}: {daysToLevel}
							</p>
						)}

						<div className={styles.buttonLines}>
							<SymbolButtons
								bonus={bonus}
								dailyValue={dailyValue}
								weeklyValue={weeklyValue}
								isBulkUpdating={isBulkUpdating}
								onValueChange={handleSymbolChange}
								optimisticDailyCleared={effectiveDailyCleared}
								optimisticWeeklyCleared={effectiveWeeklyCleared}
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

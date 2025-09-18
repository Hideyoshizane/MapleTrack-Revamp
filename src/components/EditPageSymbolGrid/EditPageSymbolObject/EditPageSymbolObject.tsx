'use client';

import * as Checkbox from '@radix-ui/react-checkbox';
import { CheckIcon, Cross2Icon } from '@radix-ui/react-icons';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';

import Tooltip from '@/components/Tooltip/Tooltip';
import ProgressBar, { JobType } from '@components/ProgressBar/ProgressBar';
import { getExpForLevel } from '@data/symbols/exp/expTable';
import {
	getSymbolImagePath,
	canUseSymbol,
	SymbolCategory,
	SymbolName,
	getSymbolMaxLevel,
	SymbolMinLevel,
	getContentValue,
	computeDailyWeeklyValues,
	calculateDaysToCompleteSymbol,
} from '@data/symbols/symbolMappings';
import { Symbol, CharacterContent } from '@models/character';

import styles from './EditPageSymbolObject.module.css';

export interface EditPageSymbolObjectProps {
	type: SymbolCategory;
	symbol: Symbol;
	characterLevel: number;
	characterJobType: string;
	size?: number;
	onChange?: (updated: Symbol) => void;
}

const EditPageSymbolObject: React.FC<EditPageSymbolObjectProps> = ({
	type,
	symbol,
	characterLevel,
	characterJobType,
	size = 24,
	onChange,
}) => {
	// Check if the character can use this symbol
	const usable = canUseSymbol(characterLevel, symbol.name);

	//Symbol max Level
	const maxLevel = getSymbolMaxLevel(type);

	// Local states
	const [level, setLevel] = useState<number>(symbol.level);
	const [levelInput, setLevelInput] = useState<string>(symbol.level.toString());
	const [expValue, setExpValue] = useState<number>(symbol.exp);
	const [expInput, setExpInput] = useState<string>(symbol.exp.toString());
	const [forceFull, setForceFull] = useState<boolean>(false);
	const [expRequired, setExpRequired] = useState<number>(getExpForLevel(type, level));
	const [contentState, setContentState] = useState<CharacterContent[]>(symbol.content);

	useEffect(() => {
		setExpRequired(getExpForLevel(type, level));
	}, [level, type]);

	// Update parent whenever local state changes
	useEffect(() => {
		onChange?.({
			...symbol,
			level,
			exp: expValue,
			content: contentState,
		});
	}, [level, expValue, contentState]); // eslint-disable-line react-hooks/exhaustive-deps

	//For progress bar
	const jobType: JobType = symbol.level === maxLevel ? 'complete' : ((characterJobType ?? 'default') as JobType);

	// Path for the symbol icon
	const src = getSymbolImagePath(symbol.name as SymbolName);

	// Checkbox handler
	const handleToggle = (index: number, checked: boolean) => {
		setContentState((prev) => prev.map((item, i) => (i === index ? { ...item, checked } : item)));
	};

	const isContentDisabled = (content: CharacterContent, characterLevel: number): boolean => {
		switch (content.contentType) {
			case 'Reverse City':
				return characterLevel < 205;
			case 'Yum Yum Island':
				return characterLevel < 215;
			default:
				return false;
		}
	};

	const { dailyValue, weeklyValue } = computeDailyWeeklyValues(symbol, contentState);
	const computedValue = calculateDaysToCompleteSymbol(dailyValue, weeklyValue, type, symbol.level, symbol.exp);

	return (
		<div className={styles.symbolContainer}>
			<div className={styles.imageContainer}>
				<Tooltip content={`Days to max Level: ${computedValue}`} placement="top" enabled={usable}>
					<Image
						src={src}
						width={size}
						height={size}
						alt={`${symbol.name} Icon`}
						className={!usable ? styles.off : ''}
						loading="lazy"
					/>
				</Tooltip>
			</div>
			<div className={styles.symbolInfo}>
				<div className={styles.levelExpInfo}>
					{usable ? (
						<>
							<p className={styles.symbolLevelText}>Level:</p>
							<input
								type="number"
								className={styles.symbolLevel}
								defaultValue=""
								placeholder={symbol.level.toString()}
								min={0}
								max={maxLevel}
								onChange={(e) => setLevelInput(e.target.value)}
								onBlur={() => {
									const levelValue = levelInput === '' ? 0 : Number(levelInput);
									setLevel(levelValue);
									setForceFull(levelValue >= maxLevel);
								}}
							/>
						</>
					) : (
						<p className={styles.symbolLevelText}>Level: 0</p>
					)}
					{usable && (
						<>
							<p className={styles.symbolLevelText}>EXP:</p>
							<input
								type="number"
								className={styles.symbolExp}
								placeholder={symbol.exp.toString()}
								min={0}
								max={expRequired}
								defaultValue={''}
								onChange={(e) => setExpInput(e.target.value)}
								onBlur={() => {
									const expVal = expInput === '' ? 0 : Number(expInput);
									setExpValue(expVal);
									setForceFull(Number(levelInput) >= maxLevel);
								}}
							/>
						</>
					)}
				</div>
				<div className={styles.progressDiv}>
					<ProgressBar
						height={8}
						width={231}
						value={usable ? expValue : 0}
						maxValue={expRequired}
						jobType={jobType}
						forceFull={forceFull}
					/>
				</div>
				{!usable && <p className={styles.unlockLevel}>Unlock at Level {SymbolMinLevel(symbol.name)}</p>}
				{usable && (
					<div className={styles.contentList}>
						{contentState.map((content, index) => (
							<label key={index} className={styles.contentItem}>
								<Checkbox.Root
									className={styles.checkboxRoot}
									checked={isContentDisabled(content, characterLevel) ? true : content.checked}
									onCheckedChange={(checked) => handleToggle(index, checked === true)}
									disabled={isContentDisabled(content, characterLevel)}>
									<Checkbox.Indicator className={styles.checkboxIndicator}>
										{isContentDisabled(content, characterLevel) ? (
											<Cross2Icon /> // show X when disabled
										) : (
											<CheckIcon /> // normal checkmark
										)}
									</Checkbox.Indicator>
								</Checkbox.Root>
								{content.contentType}: +{getContentValue(symbol.name, content.contentType)}
							</label>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default EditPageSymbolObject;

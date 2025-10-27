'use client';

import * as Checkbox from '@radix-ui/react-checkbox';
import { CheckIcon, Cross2Icon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';

import ProgressBar from '@components/ProgressBar/ProgressBar';
import Tooltip from '@components/Tooltip/Tooltip';
import { getExpForLevel } from '@data/symbols/exp/expTable';
import {
	getSymbolImagePath,
	canUseSymbol,
	getSymbolMaxLevel,
	getSymbolMinLevel,
	getContentValue,
	computeDailyWeeklyValues,
	calculateDaysToCompleteSymbol,
} from '@data/symbols/symbolMappings';

import styles from './EditPageSymbolObject.module.scss';

import type { JobType } from '@components/ProgressBar/ProgressBar';
import type { SymbolCategory, SymbolName } from '@data/symbols/symbolMappings';
import type { CharacterSymbol, CharacterContent } from '@models/character';
import type { JSX } from 'react';

export interface EditPageSymbolObjectProps {
	type: SymbolCategory;
	symbol: CharacterSymbol;
	characterLevel: number;
	characterJobType: string;
	size?: number;
	onChange?: (updated: CharacterSymbol) => void;
}

// Subcomponent for Level & EXP input

interface LevelExpInputProps {
	level: number;
	levelInput: string;
	exp: number;
	expInput: string;
	maxLevel: number;
	expRequired: number;
	setLevel: (val: number) => void;
	setExp: (val: number) => void;
	setLevelInput: (val: string) => void;
	setExpInput: (val: string) => void;
	setIsProgressFull: (val: boolean) => void;
}

function LevelExpInput({
	level,
	levelInput,
	exp,
	expInput,
	maxLevel,
	expRequired,
	setLevel,
	setExp,
	setLevelInput,
	setExpInput,
	setIsProgressFull,
}: LevelExpInputProps): JSX.Element {
	return (
		<div className={styles.levelExpInfo}>
			<p className={styles.symbolLevelText}>Level:</p>
			<input
				type="number"
				className={styles.symbolLevel}
				placeholder={level.toString()}
				min={0}
				max={maxLevel}
				value={levelInput}
				onChange={(e): void => setLevelInput(e.target.value)}
				onBlur={(): void => {
					const levelValue = levelInput === '' ? 0 : Number(levelInput);
					setLevel(levelValue);
					setIsProgressFull(levelValue >= maxLevel);
				}}
			/>

			<p className={styles.symbolLevelText}>EXP:</p>
			<input
				type="number"
				className={styles.symbolExp}
				placeholder={exp.toString()}
				min={0}
				max={expRequired}
				value={expInput}
				onChange={(e): void => setExpInput(e.target.value)}
				onBlur={(): void => {
					const expValue = expInput === '' ? 0 : Number(expInput);
					setExp(expValue);
					setIsProgressFull(levelInput !== '' && Number(levelInput) >= maxLevel);
				}}
			/>
		</div>
	);
}

// Subcomponent for Symbol Image + Tooltip
interface SymbolImageProps {
	src: string;
	size: number;
	computedValue: number;
	usable: boolean;
}

function SymbolImage({ src, size, computedValue, usable }: SymbolImageProps): JSX.Element {
	const tooltipMessage = computedValue === 0 ? 'Symbol at Max level.' : `Days to max Level: ${computedValue}`;
	return (
		<Tooltip content={tooltipMessage} placement="top" enabled={usable}>
			<Image
				src={src}
				width={size}
				height={size}
				alt="Symbol Icon"
				className={!usable ? styles.off : ''}
				loading="lazy"
			/>
		</Tooltip>
	);
}

// Subcomponent for Content Checkbox
interface ContentCheckboxProps {
	content: CharacterContent;
	index: number;
	characterLevel: number;
	handleToggle: (index: number, checked: boolean) => void;
	symbolName: string;
}

function ContentCheckbox({
	content,
	index,
	characterLevel,
	handleToggle,
	symbolName,
}: ContentCheckboxProps): JSX.Element {
	const isDisabled = ((): boolean => {
		switch (content.contentType) {
			case 'Reverse City':
				return characterLevel < 205;
			case 'Yum Yum Island':
				return characterLevel < 215;
			default:
				return false;
		}
	})();

	return (
		<label className={styles.contentItem} key={index}>
			<Checkbox.Root
				className={styles.checkboxRoot}
				checked={isDisabled ? true : content.checked}
				onCheckedChange={(checked): void => handleToggle(index, checked === true)}
				disabled={isDisabled}>
				<Checkbox.Indicator className={styles.checkboxIndicator}>
					{isDisabled ? <Cross2Icon /> : <CheckIcon />}
				</Checkbox.Indicator>
			</Checkbox.Root>
			{content.contentType}: +{getContentValue(symbolName, content.contentType)}
		</label>
	);
}

function EditPageSymbolObject({
	type,
	symbol,
	characterLevel,
	characterJobType,
	size = 24,
	onChange,
}: EditPageSymbolObjectProps): JSX.Element {
	// Check if the character can use this symbol
	const isSymbolUsable = canUseSymbol(characterLevel, symbol.name);

	//Symbol max Level
	const maxLevel = getSymbolMaxLevel(type);

	// Symbol icon
	const src = getSymbolImagePath(symbol.name as SymbolName);

	// Local states
	const [level, setLevel] = useState<number>(symbol.level);
	const [levelInput, setLevelInput] = useState<string>(symbol.level.toString());
	const [exp, setExp] = useState<number>(symbol.exp);
	const [expInput, setExpInput] = useState<string>(symbol.exp.toString());
	const [contentState, setContentState] = useState<CharacterContent[]>(symbol.content);

	const [isProgressFull, setIsProgressFull] = useState<boolean>(
		// Filled if level >= maxLevel or exp >= max EXP
		symbol.level >= maxLevel || symbol.exp >= getExpForLevel(type, symbol.level)
	);

	const expRequired = useMemo((): number => getExpForLevel(type, level), [type, level]);

	const { dailyValue, weeklyValue } = useMemo(
		(): { dailyValue: number; weeklyValue: number } => computeDailyWeeklyValues(symbol, contentState),
		[symbol, contentState]
	);

	const computedValue = useMemo(
		(): number => calculateDaysToCompleteSymbol(dailyValue, weeklyValue, type, symbol.level, symbol.exp),
		[dailyValue, weeklyValue, type, symbol.level, symbol.exp]
	);

	//For progress bar
	const jobType: JobType = symbol.level === maxLevel ? 'complete' : ((characterJobType ?? 'default') as JobType);

	// Update parent on local state changes
	useEffect((): void => {
		onChange?.({ ...symbol, level, exp, content: contentState });
	}, [level, exp, contentState]); // eslint-disable-line react-hooks/exhaustive-deps

	// Checkbox handler
	const handleContentToggle = (index: number, checked: boolean): void => {
		setContentState((prev: CharacterContent[]): CharacterContent[] =>
			prev.map((item, i): CharacterContent => (i === index ? { ...item, checked } : item))
		);
	};

	if (!isSymbolUsable) {
		return (
			<div className={styles.symbolContainer}>
				<SymbolImage src={src} size={size} computedValue={computedValue} usable={false} />
				<div className={styles.symbolOff}>
					<ProgressBar
						height={8}
						width={231}
						value={0}
						maxValue={expRequired}
						jobType={jobType}
						forceFull={isProgressFull}
					/>
					<p className={styles.unlockLevel}>Unlock at Level {getSymbolMinLevel(symbol.name)}</p>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.symbolContainer}>
			<div className={styles.imageContainer}>
				<SymbolImage src={src} size={size} computedValue={computedValue} usable={true} />
			</div>
			<div className={styles.symbolInfo}>
				<div className={styles.levelExpInfo}>
					<LevelExpInput
						level={level}
						levelInput={levelInput}
						exp={exp}
						expInput={expInput}
						maxLevel={maxLevel}
						expRequired={expRequired}
						setLevel={setLevel}
						setExp={setExp}
						setLevelInput={setLevelInput}
						setExpInput={setExpInput}
						setIsProgressFull={setIsProgressFull}
					/>
				</div>
				<div className={styles.progressDiv}>
					<ProgressBar
						height={8}
						width={231}
						value={exp}
						maxValue={expRequired}
						jobType={jobType}
						forceFull={isProgressFull}
					/>
				</div>
				<div className={styles.contentList}>
					{contentState.map(
						(content, index): JSX.Element => (
							<ContentCheckbox
								key={index}
								content={content}
								index={index}
								characterLevel={characterLevel}
								handleToggle={handleContentToggle}
								symbolName={symbol.name}
							/>
						)
					)}
				</div>
			</div>
		</div>
	);
}

export default EditPageSymbolObject;

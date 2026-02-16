'use client';

import * as Checkbox from '@radix-ui/react-checkbox';
import { CheckIcon, Cross2Icon } from '@radix-ui/react-icons';
import Image from 'next/image';

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
import type { Character, CharacterSymbol, CharacterContent } from '@features/character/characterModel';
import type { JSX } from 'react';

export type EditPageSymbolObjectProps = {
	type: SymbolCategory;
	symbol: CharacterSymbol;
	characterLevel: number;
	characterJobType: string;
	size?: number;
	updateCharacter: (recipe: (draft: Character) => void) => void;
};

type SymbolUpdatePayload =
	| { type: 'level'; value: number }
	| { type: 'exp'; value: number }
	| { type: 'content'; index: number; checked: boolean };

type LevelExpInputProps = {
	level: number;
	exp: number;
	maxLevel: number;
	expRequired: number;
	onLevelBlur: (value: number) => void;
	onExpBlur: (value: number) => void;
};

function LevelExpInput({ level, exp, maxLevel, expRequired, onLevelBlur, onExpBlur }: LevelExpInputProps): JSX.Element {
	return (
		<div className={styles.levelExpInfo}>
			<p className={styles.symbolLevelText}>Level:</p>
			<input
				type="number"
				className={styles.symbolLevel}
				defaultValue={level}
				min={0}
				max={maxLevel}
				onBlur={(e) => onLevelBlur(Number(e.target.value || 0))}
			/>

			<p className={styles.symbolLevelText}>EXP:</p>
			<input
				type="number"
				className={styles.symbolExp}
				defaultValue={exp}
				min={0}
				max={expRequired}
				onBlur={(e) => onExpBlur(Number(e.target.value || 0))}
			/>
		</div>
	);
}

type SymbolImageProps = {
	src: string;
	size: number;
	computedValue: number;
	usable: boolean;
};

function SymbolImage({ src, size, computedValue, usable }: SymbolImageProps): JSX.Element {
	const tooltipMessage = computedValue === 0 ? 'Symbol at Max level.' : `Days to max Level: ${computedValue}`;

	return (
		<Tooltip content={tooltipMessage} placement="top" enabled={usable}>
			<Image src={src} width={size} height={size} alt="Symbol Icon" className={!usable ? styles.off : ''} />
		</Tooltip>
	);
}

type ContentCheckboxProps = {
	content: CharacterContent;
	index: number;
	characterLevel: number;
	onToggle: (index: number, checked: boolean) => void;
	symbolName: string;
};

function ContentCheckbox({ content, index, characterLevel, onToggle, symbolName }: ContentCheckboxProps): JSX.Element {
	const isDisabled =
		content.contentType === 'Reverse City'
			? characterLevel < 205
			: content.contentType === 'Yum Yum Island'
			? characterLevel < 215
			: false;

	return (
		<label className={styles.contentItem}>
			<Checkbox.Root
				className={styles.checkboxRoot}
				checked={isDisabled ? true : content.checked}
				disabled={isDisabled}
				onCheckedChange={(checked) => onToggle(index, checked === true)}>
				<Checkbox.Indicator className={styles.checkboxIndicator}>
					{isDisabled ? <Cross2Icon /> : <CheckIcon />}
				</Checkbox.Indicator>
			</Checkbox.Root>
			{content.contentType}: +{getContentValue(symbolName, content.contentType)}
		</label>
	);
}

export function EditPageSymbolObject({
	type,
	symbol,
	characterLevel,
	characterJobType,
	size = 24,
	updateCharacter,
}: EditPageSymbolObjectProps): JSX.Element {
	const isSymbolUsable = canUseSymbol(characterLevel, symbol.name);
	const maxLevel = getSymbolMaxLevel(type);
	const src = getSymbolImagePath(symbol.name as SymbolName);

	const expRequired = getExpForLevel(type, symbol.level);

	const { dailyValue, weeklyValue } = computeDailyWeeklyValues(symbol, symbol.content);

	const computedValue = calculateDaysToCompleteSymbol(dailyValue, weeklyValue, type, symbol.level, symbol.exp);

	const jobType: JobType = symbol.level >= maxLevel ? 'complete' : ((characterJobType ?? 'default') as JobType);

	const updateSymbol = (payload: SymbolUpdatePayload): void => {
		updateCharacter((draft) => {
			const target = draft.symbols.find((s) => s.name === symbol.name);

			if (!target) {
				return;
			}

			switch (payload.type) {
				case 'level': {
					target.level = payload.value;
					target.exp = Math.min(target.exp, getExpForLevel(type, payload.value));
					return;
				}

				case 'exp': {
					target.exp = payload.value;
					return;
				}

				case 'content': {
					const targetContent = target.content;
					if (targetContent[payload.index]) {
						targetContent[payload.index].checked = payload.checked;
					}
				}
			}
		});
	};

	if (!isSymbolUsable) {
		return (
			<div className={styles.symbolContainer}>
				<SymbolImage src={src} size={size} computedValue={computedValue} usable={false} />
				<div className={styles.symbolOff}>
					<ProgressBar height={8} width={231} value={0} maxValue={expRequired} jobType={jobType} forceFull={false} />
					<p className={styles.unlockLevel}>Unlock at Level {getSymbolMinLevel(symbol.name)}</p>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.symbolContainer}>
			<div className={styles.imageContainer}>
				<SymbolImage src={src} size={size} computedValue={computedValue} usable />
			</div>

			<div className={styles.symbolInfo}>
				<LevelExpInput
					level={symbol.level}
					exp={symbol.exp}
					maxLevel={maxLevel}
					expRequired={expRequired}
					onLevelBlur={(value) => updateSymbol({ type: 'level', value })}
					onExpBlur={(value) => updateSymbol({ type: 'exp', value })}
				/>

				<div className={styles.progressDiv}>
					<ProgressBar
						height={8}
						width={231}
						value={symbol.exp}
						maxValue={expRequired}
						jobType={jobType}
						forceFull={symbol.level >= maxLevel}
					/>
				</div>

				<div className={styles.contentList}>
					{symbol.content.map((content, index) => (
						<ContentCheckbox
							key={`${symbol.name}-${content.contentType}`}
							content={content}
							index={index}
							characterLevel={characterLevel}
							symbolName={symbol.name}
							onToggle={(i, checked) =>
								updateSymbol({
									type: 'content',
									index: i,
									checked,
								})
							}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

export default EditPageSymbolObject;

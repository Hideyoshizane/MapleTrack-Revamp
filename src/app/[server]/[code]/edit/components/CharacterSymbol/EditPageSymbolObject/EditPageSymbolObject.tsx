'use client';

import * as Checkbox from '@radix-ui/react-checkbox';
import Image from 'next/image';

import CheckIcon from '@assets/svg/check.svg';
import CrossIcon from '@assets/svg/cross-2.svg';
import ProgressBar from '@components/ProgressBar/ProgressBar';
import Tooltip from '@components/Tooltip/Tooltip';
import { getExpForLevel } from '@data/symbols/exp/expTable';
import {
	getSymbolImagePath,
	canUseSymbol,
	getSymbolMaxLevelByCategory,
	getSymbolMinLevel,
	getContentValue,
	computeDailyWeeklyValues,
	calculateDaysToCompleteSymbol,
} from '@data/symbols/symbolMappings';

import styles from './EditPageSymbolObject.module.scss';

import type { JobType } from '@components/ProgressBar/ProgressBar';
import type {
	getEditCharacterDataSymbolsResponseBody,
	getEditCharacterDataResponseBody,
	getEditCharacterContentResponseBody,
} from '@features/character/schemas/character.response.schema';
import type { CharacterContent, SymbolCategory } from '@prisma/client';
import type { JSX } from 'react';

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
				className={styles.symbolLevel}
				defaultValue={level}
				max={maxLevel}
				min={0}
				onBlur={(e) => onLevelBlur(Number(e.target.value || 0))}
				type="number"
			/>

			<p className={styles.symbolLevelText}>EXP:</p>
			<input
				className={styles.symbolExp}
				defaultValue={exp}
				max={expRequired}
				min={0}
				onBlur={(e) => onExpBlur(Number(e.target.value || 0))}
				type="number"
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
		<Tooltip content={tooltipMessage} enabled={usable} placement="top">
			<Image className={!usable ? styles.off : ''} alt="Symbol Icon" height={size} src={src} width={size} />
		</Tooltip>
	);
}

type ContentCheckboxProps = {
	content: getEditCharacterContentResponseBody;
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
				onCheckedChange={(checked) => onToggle(index, checked === true)}
			>
				<Checkbox.Indicator className={styles.checkboxIndicator}>
					{isDisabled ? <CrossIcon /> : <CheckIcon />}
				</Checkbox.Indicator>
			</Checkbox.Root>
			{content.contentType}: +{getContentValue(symbolName, content.contentType, 300)}
		</label>
	);
}

type Props = {
	type: SymbolCategory;
	symbol: getEditCharacterDataSymbolsResponseBody;
	characterLevel: number;
	characterJobType: string;
	size?: number;
	updateCharacter: (recipe: (draft: getEditCharacterDataResponseBody) => void) => void;
};

type SymbolUpdatePayload =
	| { type: 'level'; value: number; category: SymbolCategory; name: string }
	| { type: 'exp'; value: number; category: SymbolCategory; name: string }
	| { type: 'content'; index: number; checked: boolean; category: SymbolCategory; name: string };

type CharacterContentUI = CharacterContent & {
	type: 'daily' | 'weekly';
};

function EditPageSymbolObject({
	type,
	symbol,
	characterLevel,
	characterJobType,
	size = 24,
	updateCharacter,
}: Props): JSX.Element {
	const isSymbolUsable = canUseSymbol(characterLevel, symbol.name);
	const maxLevel = getSymbolMaxLevelByCategory(type);
	const src = getSymbolImagePath(symbol.name);

	const expRequired = getExpForLevel(type, symbol.level);

	const { dailyValue, weeklyValue } = computeDailyWeeklyValues(
		{ name: symbol.name, level: symbol.level, exp: symbol.exp, category: symbol.category },
		symbol.contents as CharacterContentUI[],
		characterLevel,
	);

	const computedValue = calculateDaysToCompleteSymbol(
		dailyValue,
		weeklyValue,
		type,
		symbol.level,
		symbol.exp,
		symbol.contents.at(-1)?.tries || 0,
		symbol.contents[0].cleared || false,
	);

	const jobType: JobType = symbol.level >= maxLevel ? 'complete' : ((characterJobType ?? 'default') as JobType);

	const updateSymbol = (payload: SymbolUpdatePayload): void => {
		updateCharacter((draft) => {
			const targetArray = draft.symbols[payload.category];
			const target = targetArray.find((s) => s.name === payload.name);
			if (!target) {
				return;
			}

			switch (payload.type) {
				case 'level':
					target.level = payload.value;
					target.exp = Math.min(target.exp, getExpForLevel(payload.category, payload.value));

					break;
				case 'exp':
					target.exp = payload.value;

					break;
				case 'content':
					if (target.contents[payload.index]) {
						target.contents[payload.index].checked = payload.checked;
					}

					break;
			}
		});
	};

	if (!isSymbolUsable) {
		return (
			<div className={styles.symbolContainer}>
				<SymbolImage computedValue={computedValue} size={size} src={src} usable={false} />
				<div className={styles.symbolOff}>
					<ProgressBar
						forceFull={false}
						height={8}
						jobType={jobType}
						maxValue={expRequired}
						value={0}
						width={231}
					/>
					<p className={styles.unlockLevel}>Unlock at Level {getSymbolMinLevel(symbol.name)}</p>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.symbolContainer}>
			<div className={styles.imageContainer}>
				<SymbolImage computedValue={computedValue} size={size} src={src} usable />
			</div>

			<div className={styles.symbolInfo}>
				<LevelExpInput
					exp={symbol.exp}
					expRequired={expRequired}
					level={symbol.level}
					maxLevel={maxLevel}
					onExpBlur={(value) => updateSymbol({ type: 'exp', value, category: type, name: symbol.name })}
					onLevelBlur={(value) => updateSymbol({ type: 'level', value, category: type, name: symbol.name })}
				/>

				<div className={styles.progressDiv}>
					<ProgressBar
						forceFull={symbol.level >= maxLevel}
						height={8}
						jobType={jobType}
						maxValue={expRequired}
						value={symbol.exp}
						width={231}
					/>
				</div>

				<div className={styles.contentList}>
					{symbol.contents.map((content, index) => (
						<ContentCheckbox
							characterLevel={characterLevel}
							content={content}
							index={index}
							key={`${symbol.name}-${content.contentType}`}
							onToggle={(i, checked) =>
								updateSymbol({ type: 'content', index: i, checked, category: type, name: symbol.name })
							}
							symbolName={symbol.name}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

export default EditPageSymbolObject;

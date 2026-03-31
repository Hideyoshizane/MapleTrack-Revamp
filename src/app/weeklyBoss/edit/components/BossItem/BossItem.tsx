'use client';

import NumberFlow from '@number-flow/react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

import ResponsiveText from '@components/ResponsiveText/ResponsiveText';
import { isRebootServer } from '@data/servers/servers';

import BossDropdownButton from '../../BossDropdownButton/BossDropdownButton';
import BossButton from '../BossButton/BossButton';

import styles from './BossItem.module.scss';

import type { JSX } from 'react';

export type BossDifficulty = {
	name: string;
	value: number;
	reset: string;
	minLevel: number;
};

export type Boss = {
	name: string;
	img: string;
	difficulties: BossDifficulty[];
};

export type BossProgress = {
	name: string;
	difficulty: string;
	reset: 'Daily' | 'Weekly' | 'Monthly';
	cleared: boolean;
	dailyTotal?: number;
	date?: Date | null;
	locked?: boolean;
};

type BossItemProps = {
	serverCookie: string;
	boss: Boss;
	selectedBosses: BossProgress[];
	selectedCharacterLevel: number;
	onBossUpdate: (
		bossName: string,
		difficulty: string,
		reset: 'Daily' | 'Weekly' | 'Monthly',
		dailyTotal?: number,
	) => void;
};

const BossItem = ({
	serverCookie,
	boss,
	selectedBosses,
	selectedCharacterLevel,
	onBossUpdate,
}: BossItemProps): JSX.Element => {
	const isSmallButtons = boss.difficulties.length > 3;
	const gapClass = isSmallButtons ? styles.smallGap : styles.largeGap;

	const getSelection = (diffName: string, reset: string): BossProgress | undefined => {
		return selectedBosses.find((b) => b.difficulty === diffName && b.reset === reset);
	};

	const totalGold: number = selectedBosses.reduce((total, progress) => {
		const difficulty = boss.difficulties.find((d) => d.name === progress.difficulty && d.reset === progress.reset);

		if (!difficulty) {
			return total;
		}

		const baseValue: number = difficulty.value ?? 0;
		const goldValue: number = isRebootServer(serverCookie) ? baseValue * 5 : baseValue;

		return progress.reset === 'Daily' ? total + goldValue * (progress.dailyTotal ?? 0) : total + goldValue;
	}, 0);

	const handleBossUpdate = (
		bossName: string,
		difficulty: string,
		reset: 'Daily' | 'Weekly' | 'Monthly',
		dailyTotal?: number,
	): void => {
		onBossUpdate(bossName, difficulty, reset, dailyTotal);
	};

	const anySelected = boss.difficulties.some((d) => !!getSelection(d.name, d.reset));

	// Animation
	const [parentWidthExpanded, setParentWidthExpanded] = useState(false);
	const [showGoldContainer, setShowGoldContainer] = useState(false);
	const [goldOpacity, setGoldOpacity] = useState(0);
	const [numberFlowValue, setNumberFlowValue] = useState(0);
	const [closing, setClosing] = useState(false);

	useEffect(() => {
		if (anySelected) {
			// OPENING
			queueMicrotask(() => setParentWidthExpanded(true));
			queueMicrotask(() => {
				setShowGoldContainer(true);

				if (!showGoldContainer) {
					setGoldOpacity(0);
					setNumberFlowValue(0);
				}
			});

			setTimeout(() => setGoldOpacity(1), 100);
			setTimeout(() => setNumberFlowValue(totalGold), 150);
		} else if (!anySelected && showGoldContainer) {
			// CLOSING
			queueMicrotask(() => {
				setClosing(true);
				setNumberFlowValue(0);
			});
		}
	}, [anySelected, totalGold, showGoldContainer]);

	return (
		<motion.div
			layout
			className={styles.bossSlotBody}
			animate={{ width: parentWidthExpanded ? 720 : 576 }}
			transition={{ duration: 0.2, ease: 'easeInOut' }}>
			<div className={styles.bossSlotContent}>
				<Image
					className={styles.bossIcon}
					src={boss.img}
					alt={`${boss.name} portrait`}
					width={64}
					height={64}
					priority
				/>

				<ResponsiveText className={styles.bossName} width={120} height={52} maxFontSize={28} minFontSize={20}>
					{boss.name}
				</ResponsiveText>

				<div className={clsx(styles.bossButtons, gapClass)}>
					{boss.difficulties.map((difficulty) => {
						const selection = getSelection(difficulty.name, difficulty.reset);
						const isSelected = !!selection;

						if (difficulty.reset === 'Daily') {
							return (
								<BossDropdownButton
									key={difficulty.name}
									selected={isSelected}
									value={selection?.dailyTotal ?? 0}
									locked={selectedCharacterLevel < difficulty.minLevel}
									difficulty={difficulty}
									isSmallButtons={isSmallButtons}
									onSelectDifficulty={(diff, multiplier) => {
										handleBossUpdate(boss.name, diff.name, 'Daily', multiplier);
									}}
								/>
							);
						}

						return (
							<BossButton
								key={difficulty.name}
								selected={isSelected}
								difficulty={difficulty}
								isSmallButtons={isSmallButtons}
								characterLevel={selectedCharacterLevel}
								onSelect={() => {
									handleBossUpdate(boss.name, difficulty.name, difficulty.reset as 'Weekly' | 'Monthly');
								}}
							/>
						);
					})}
				</div>

				<AnimatePresence>
					{showGoldContainer && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: goldOpacity }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className={styles.goldValue}
							onAnimationComplete={() => {
								if (closing && goldOpacity === 0) {
									setParentWidthExpanded(false);
									setShowGoldContainer(false);
									setClosing(false);
								}
							}}>
							<NumberFlow
								className={styles.goldText}
								value={numberFlowValue}
								transformTiming={{ duration: 200 }}
								onAnimationsFinish={() => {
									if (closing) {
										setGoldOpacity(0);
									}
								}}
							/>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.div>
	);
};

export default BossItem;

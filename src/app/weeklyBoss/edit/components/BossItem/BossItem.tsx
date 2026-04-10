'use client';

import NumberFlow from '@number-flow/react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

import ResponsiveText from '@components/ResponsiveText/responsiveText';
import {
	parseBossName,
	parseBossDifficultyName,
	getBossDifficultyValue,
	isValidBossDifficulty,
	getBossImage,
} from '@data/bosses/bosses';

import BossButton from '../BossButton/bossButton';
import BossDropdownButton from '../BossDropdownButton/bossDropdownButton';

import styles from './bossItem.module.scss';

import type { BossName, BossDifficultyName, BossReset, Boss } from '@data/bosses/bosses';
import type { getEditBossListBossResponseBody } from '@features/Boss/schemas/bossList.response.schema';
import type { JSX } from 'react';

type BossItemProps = {
	serverCookie: string;
	boss: Boss;
	selectedBosses: getEditBossListBossResponseBody[];
	selectedCharacterLevel: number;
	onBossUpdate: (
		bossName: BossName,
		difficulty: BossDifficultyName,
		server: string,
		reset: BossReset,
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

	const selectionMap = new Map<string, getEditBossListBossResponseBody>();
	for (const b of selectedBosses) {
		selectionMap.set(`${b.difficulty}|${b.reset}`, b);
	}

	const getSelection = (diffName: string, reset: string): getEditBossListBossResponseBody | undefined => {
		return selectionMap.get(`${diffName}|${reset}`);
	};

	const totalGold: number = (() => {
		const bossNameParsed = parseBossName(boss.name);

		if (!bossNameParsed) {
			return 0;
		}

		let total = 0;

		for (const progress of selectedBosses) {
			const difficultyParsed = parseBossDifficultyName(progress.difficulty);
			if (!difficultyParsed) {
				continue;
			}

			if (!isValidBossDifficulty(bossNameParsed, difficultyParsed)) {
				continue;
			}

			const value = getBossDifficultyValue(bossNameParsed, difficultyParsed, serverCookie);
			if (!value) {
				continue;
			}

			total += progress.reset === 'Daily' ? value * (progress.dailyTotal ?? 0) : value;
		}

		return total;
	})();

	const handleBossUpdate = (
		serverCookie: string,
		bossName: BossName,
		difficulty: BossDifficultyName,
		reset: BossReset,
		dailyTotal?: number,
	): void => {
		const parsedBoss = parseBossName(bossName);
		const parsedDifficulty = parseBossDifficultyName(difficulty);

		if (!parsedBoss || !parsedDifficulty) {
			return;
		}

		onBossUpdate(parsedBoss, parsedDifficulty, serverCookie, reset, dailyTotal);
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
					src={getBossImage(boss.name as BossName)}
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
										handleBossUpdate(serverCookie, boss.name, diff.name, 'Daily', multiplier);
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
									handleBossUpdate(serverCookie, boss.name, difficulty.name, difficulty.reset);
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

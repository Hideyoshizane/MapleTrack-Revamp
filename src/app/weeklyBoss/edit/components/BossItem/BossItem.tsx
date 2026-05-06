'use client';

import NumberFlow from '@number-flow/react';
import { clsx } from 'clsx';
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';

import ResponsiveText from '@components/ResponsiveText/ResponsiveText';
import {
	parseBossName,
	parseBossDifficultyName,
	getBossDifficultyValue,
	isValidBossDifficulty,
	getBossImage,
} from '@data/bosses/bosses';

import BossButton from '../BossButton/BossButton';
import BossDropdownButton from '../BossDropdownButton/BossDropdownButton';

import styles from './BossItem.module.scss';

import type { BossName, BossDifficultyName, BossReset, Boss } from '@data/bosses/bosses';
import type { getEditBossListBossResponseBody } from '@features/boss/schemas/bossList.response.schema';
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
		<LazyMotion features={domAnimation} strict>
			<m.div
				className={styles.bossSlotBody}
				animate={{ width: parentWidthExpanded ? 720 : 576 }}
				layout
				transition={{ duration: 0.2, ease: 'easeInOut' }}>
				<div className={styles.bossSlotContent}>
					<Image
						className={styles.bossIcon}
						alt={`${boss.name} portrait`}
						height={64}
						priority
						src={getBossImage(boss.name as BossName)}
						width={64}
					/>

					<ResponsiveText className={styles.bossName} height={52} maxFontSize={28} minFontSize={20} width={120}>
						{boss.name}
					</ResponsiveText>

					<div className={clsx(styles.bossButtons, gapClass)}>
						{boss.difficulties.map((difficulty) => {
							const selection = getSelection(difficulty.name, difficulty.reset);
							const isSelected = !!selection;

							if (difficulty.reset === 'Daily') {
								return (
									<BossDropdownButton
										difficulty={difficulty}
										isSmallButtons={isSmallButtons}
										key={difficulty.name}
										locked={selectedCharacterLevel < difficulty.minLevel}
										onSelectDifficulty={(diff, multiplier) => {
											handleBossUpdate(serverCookie, boss.name, diff.name, 'Daily', multiplier);
										}}
										selected={isSelected}
										value={selection?.dailyTotal ?? 0}
									/>
								);
							}

							return (
								<BossButton
									characterLevel={selectedCharacterLevel}
									difficulty={difficulty}
									isSmallButtons={isSmallButtons}
									key={difficulty.name}
									onSelect={() => {
										handleBossUpdate(serverCookie, boss.name, difficulty.name, difficulty.reset);
									}}
									selected={isSelected}
								/>
							);
						})}
					</div>

					<AnimatePresence>
						{showGoldContainer && (
							<m.div
								className={styles.goldValue}
								animate={{ opacity: goldOpacity }}
								exit={{ opacity: 0 }}
								initial={{ opacity: 0 }}
								onAnimationComplete={() => {
									if (closing && goldOpacity === 0) {
										setParentWidthExpanded(false);
										setShowGoldContainer(false);
										setClosing(false);
									}
								}}
								transition={{ duration: 0.2 }}>
								<NumberFlow
									className={styles.goldText}
									onAnimationsFinish={() => {
										if (closing) {
											setGoldOpacity(0);
										}
									}}
									transformTiming={{ duration: 200 }}
									value={numberFlowValue}
								/>
							</m.div>
						)}
					</AnimatePresence>
				</div>
			</m.div>
		</LazyMotion>
	);
};

export default BossItem;

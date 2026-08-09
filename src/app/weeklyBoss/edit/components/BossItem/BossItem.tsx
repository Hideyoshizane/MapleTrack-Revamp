'use client';

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

import BossGoldPartySelectComponent from './BossGoldPartySelectComponent/BossGoldPartySelectComponent';
import styles from './BossItem.module.scss';

import type { BossName, BossDifficultyName, BossReset, Boss } from '@data/bosses/bosses';
import type { getEditBossListBossResponseBody } from '@features/boss/schemas/bossList.response.schema';
import type { JSX } from 'react';

export type selectedBossesResetAndParty = {
	resets: {
		Daily: boolean;
		Weekly: boolean;
		Monthly: boolean;
	};
	partySizes: {
		Daily: number;
		Weekly: number;
		Monthly: number;
	};
	value: {
		Daily: number;
		Weekly: number;
		Monthly: number;
	};
};

const getBossesResetAndParty = (
	selectedBosses: getEditBossListBossResponseBody[],
	server: string,
): selectedBossesResetAndParty => {
	const selection: selectedBossesResetAndParty = {
		resets: { Daily: false, Weekly: false, Monthly: false },
		partySizes: { Daily: 1, Weekly: 1, Monthly: 1 },
		value: { Daily: 0, Weekly: 0, Monthly: 0 },
	};

	for (const selectedBoss of selectedBosses) {
		selection.resets[selectedBoss.reset] = true;
		selection.partySizes[selectedBoss.reset] = selectedBoss.partySize;

		const value = getBossDifficultyValue(selectedBoss.name, selectedBoss.difficulty, server);

		selection.value[selectedBoss.reset] =
			selectedBoss.reset === 'Daily' ? value * (selectedBoss.dailyTotal ?? 0) : value;
	}

	return selection;
};

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
		partySize: number,
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

	const bossesResetAndType = getBossesResetAndParty(selectedBosses, serverCookie);

	const totalGoldByPartySize =
		bossesResetAndType.value.Daily / bossesResetAndType.partySizes.Daily +
		bossesResetAndType.value.Weekly / bossesResetAndType.partySizes.Weekly +
		bossesResetAndType.value.Monthly / bossesResetAndType.partySizes.Monthly;

	const selectionMap = new Map<string, getEditBossListBossResponseBody>();
	for (const b of selectedBosses) {
		selectionMap.set(`${b.difficulty}|${b.reset}`, b);
	}

	const getSelection = (diffName: string, reset: string): getEditBossListBossResponseBody | undefined => {
		return selectionMap.get(`${diffName}|${reset}`);
	};

	const selectedBoss = selectedBosses.find((bossSelection) => {
		const parsedBoss = parseBossName(boss.name);
		const parsedDifficulty = parseBossDifficultyName(bossSelection.difficulty);
		if (!parsedBoss || !parsedDifficulty) {
			return false;
		}

		return isValidBossDifficulty(parsedBoss, parsedDifficulty);
	});

	const handleBossUpdate = (
		serverCookie: string,
		bossName: BossName,
		difficulty: BossDifficultyName,
		reset: BossReset,
		partySize: number,
		dailyTotal?: number,
	): void => {
		const parsedBoss = parseBossName(bossName);
		const parsedDifficulty = parseBossDifficultyName(difficulty);

		if (!parsedBoss || !parsedDifficulty) {
			return;
		}

		onBossUpdate(parsedBoss, parsedDifficulty, serverCookie, reset, partySize, dailyTotal);
	};

	const anySelected = boss.difficulties.some((difficulty) =>
		Boolean(getSelection(difficulty.name, difficulty.reset)),
	);

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
			setTimeout(() => setNumberFlowValue(totalGoldByPartySize), 150);
		} else if (!anySelected && showGoldContainer) {
			// CLOSING
			queueMicrotask(() => {
				setClosing(true);
				setNumberFlowValue(0);
			});
		}
	}, [anySelected, totalGoldByPartySize, showGoldContainer]);

	return (
		<LazyMotion features={domAnimation} strict>
			<m.div
				className={styles.bossSlotBody}
				animate={{ width: parentWidthExpanded ? 720 : 576 }}
				layout
				transition={{ duration: 0.2, ease: 'easeInOut' }}
			>
				<div className={styles.bossSlotContent}>
					<Image
						className={styles.bossIcon}
						alt={`${boss.name} portrait`}
						height={64}
						priority
						src={getBossImage(boss.name)}
						width={64}
					/>

					<ResponsiveText
						className={styles.bossName}
						height={52}
						maxFontSize={28}
						minFontSize={20}
						width={120}
					>
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
											handleBossUpdate(
												serverCookie,
												boss.name,
												diff.name,
												'Daily',
												bossesResetAndType.partySizes['Daily'] ?? 1,
												multiplier,
											);
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
										handleBossUpdate(
											serverCookie,
											boss.name,
											difficulty.name,
											difficulty.reset,
											bossesResetAndType.partySizes[difficulty.reset] ?? 1,
										);
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
								transition={{ duration: 0.2 }}
							>
								<BossGoldPartySelectComponent
									closing={closing}
									bossesResetAndType={bossesResetAndType}
									selectedReset={selectedBoss?.reset ?? 'Daily'}
									maxPartySize={boss.maxPartySize}
									onClosingAnimationFinish={() => {
										setGoldOpacity(0);
									}}
									onSelectPartySize={(reset, newPartySize) => {
										const selectedResetBoss = selectedBosses.find(
											(bossSelection) => bossSelection.reset === reset,
										);

										if (!selectedResetBoss) {
											return;
										}

										handleBossUpdate(
											serverCookie,
											boss.name,
											selectedResetBoss.difficulty,
											reset,
											newPartySize,
											selectedResetBoss.dailyTotal,
										);
									}}
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

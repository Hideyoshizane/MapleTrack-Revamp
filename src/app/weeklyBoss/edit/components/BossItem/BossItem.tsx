'use client';

import NumberFlow from '@number-flow/react';
import { clsx } from 'clsx';
import Image from 'next/image';
import { useState, useEffect, useCallback, useMemo } from 'react';

import { isRebootServer } from '@/data/servers/servers';
import ResponsiveText from '@components/ResponsiveText/ResponsiveText';

import BossDropdownButton from '../../BossDropdownButton/BossDropdownButton';
import BossButton from '../BossButton/BossButton';

import styles from './BossItem.module.scss';

import type { JSX } from 'react';

export interface BossDifficulty {
	name: string;
	value: number;
	reset: string;
	minLevel: number;
}

export interface Boss {
	name: string;
	img: string;
	difficulties: BossDifficulty[];
}

export interface BossProgress {
	name: string;
	difficulty: string;
	reset: 'Daily' | 'Weekly' | 'Monthly';
	cleared: boolean;
	DailyTotal?: number;
	date?: Date;
	locked?: boolean;
}

interface BossItemProps {
	serverCookie: string;
	boss: Boss;
	selectedBoss: BossProgress | null;
	selectedCharacterLevel: number;

	onSelect: (boss: BossProgress) => void;
	onRemove: (reset: BossProgress['reset']) => void;
}

const BossItem = ({
	serverCookie,
	boss,
	selectedBoss,
	selectedCharacterLevel,
	onSelect,
	onRemove,
}: BossItemProps): JSX.Element => {
	const [dailyGold, setDailyGold] = useState<number>(0);
	const [weeklyGold, setWeeklyGold] = useState<number>(0);
	const [monthlyGold, setMonthlyGold] = useState<number>(0);

	const [totalGold, setTotalGold] = useState<number>(0);
	const [animatedGold, setAnimatedGold] = useState<number>(0);

	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [isOpenAfter, setIsOpenAfter] = useState<boolean>(false);
	const [isClosing, setIsClosing] = useState<boolean>(false);

	const [dailyMultiplier, setDailyMultiplier] = useState<number>(0);

	const goldSetters = useMemo(
		(): Record<string, (value: number) => void> => ({
			Daily: setDailyGold,
			Weekly: setWeeklyGold,
			Monthly: setMonthlyGold,
		}),
		[]
	);

	const [selectedByReset, setSelectedByReset] = useState<Record<string, string | null>>({
		Daily: null,
		Weekly: null,
		Monthly: null,
	});

	const isSmallButtons = boss.difficulties.length > 3;
	const gapClass = isSmallButtons ? styles.smallGap : styles.largeGap;

	const handleSelectDifficulty = useCallback(
		(difficulty: BossDifficulty): void => {
			setSelectedByReset((prev): Record<string, string | null> => {
				const current = prev[difficulty.reset];

				if (current === difficulty.name) {
					goldSetters[difficulty.reset]?.(0);
					queueMicrotask((): void => onRemove(difficulty.reset as BossProgress['reset']));
					return { ...prev, [difficulty.reset]: null };
				}

				const bossValue = isRebootServer(serverCookie) ? difficulty.value * 5 : difficulty.value;
				goldSetters[difficulty.reset]?.(bossValue);

				queueMicrotask((): void => {
					onSelect({
						name: boss.name,
						difficulty: difficulty.name,
						reset: difficulty.reset as BossProgress['reset'],
						cleared: false,
					});
				});
				return { ...prev, [difficulty.reset]: difficulty.name };
			});
		},
		[goldSetters, serverCookie, onSelect, onRemove, boss.name]
	);

	useEffect((): void => {
		if (!selectedBoss) return;

		setSelectedByReset(
			(prev): Record<string, string | null> => ({
				...prev,
				[selectedBoss.reset]: selectedBoss.difficulty,
			})
		);

		const found = boss.difficulties.find(
			(d): boolean => d.name === selectedBoss.difficulty && d.reset === selectedBoss.reset
		);
		if (!found) return;

		const base = isRebootServer(serverCookie) ? found.value * 5 : found.value;

		if (found.reset === 'Daily') setDailyGold(base);
		if (found.reset === 'Weekly') setWeeklyGold(base);
		if (found.reset === 'Monthly') setMonthlyGold(base);
	}, [selectedBoss, boss.difficulties, serverCookie]);

	// Total Gold
	useEffect((): void => {
		setTotalGold(dailyGold + weeklyGold + monthlyGold);
	}, [dailyGold, weeklyGold, monthlyGold]);

	// Enter Animation
	useEffect((): void => {
		if (totalGold > 0) {
			setIsClosing(false);
			setIsOpen(true);
		} else if (totalGold === 0 && isOpen) {
			setIsClosing(true);
			setAnimatedGold(0);
		}
	}, [totalGold, isOpen]);

	useEffect((): void | (() => void) => {
		if (isOpen && totalGold > 0) {
			setIsOpenAfter(true);
			setAnimatedGold(0);
			const timeout = setTimeout((): void => setAnimatedGold(totalGold), 5);
			return (): void => clearTimeout(timeout);
		}
	}, [isOpen, totalGold]);

	// Close Animation
	useEffect((): void | (() => void) => {
		if (isClosing) {
			const timeout = setTimeout((): void => {
				setIsOpen(false);
				setIsOpenAfter(false);
				setIsClosing(false);
			}, 300);
			return (): void => clearTimeout(timeout);
		}
	}, [isClosing]);

	const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>): void => {
		if (e.propertyName === 'width' && isOpen && totalGold > 0) {
			setIsOpenAfter(true);
		}
	};

	return (
		<div className={clsx(styles.bossSlotBody, { [styles.open]: isOpen })} onTransitionEnd={handleTransitionEnd}>
			<div className={styles.bossSlotContent}>
				<Image
					className={styles.bossIcon}
					src={boss.img}
					alt={`${boss.name} portrait image`}
					width={64}
					height={64}
					priority
				/>

				<ResponsiveText className={styles.bossName} width={120} height={52} maxFontSize={28} minFontSize={20}>
					{boss.name}
				</ResponsiveText>

				<div className={clsx(styles.bossButtons, gapClass)}>
					{boss.difficulties.map((difficulty): JSX.Element => {
						const isSelected = selectedByReset[difficulty.reset] === difficulty.name;

						if (difficulty.reset === 'Daily') {
							return (
								<BossDropdownButton
									key={difficulty.name}
									selected={false}
									value={selectedByReset.Daily === difficulty.name ? dailyMultiplier : 0}
									locked={selectedCharacterLevel < difficulty.minLevel}
									difficulty={difficulty}
									isSmallButtons={isSmallButtons}
									onSelectDifficulty={(difficulty, multiplier): void => {
										setDailyGold(0);
										setSelectedByReset((prev): Record<string, string | null> => ({ ...prev, Daily: null }));

										const calculatedGold = isRebootServer(serverCookie)
											? difficulty.value * 5 * multiplier
											: difficulty.value * multiplier;
										setDailyMultiplier(0);
										setDailyGold(calculatedGold);

										setSelectedByReset(
											(prev): Record<string, string | null> => ({
												...prev,
												Daily: difficulty.name,
											})
										);

										setDailyMultiplier(multiplier);
									}}
								/>
							);
						}

						return (
							<BossButton
								key={difficulty.name}
								type="button"
								selected={isSelected}
								difficulty={difficulty}
								isSmallButtons={isSmallButtons}
								characterLevel={selectedCharacterLevel}
								onSelect={(): void => handleSelectDifficulty(difficulty)}
							/>
						);
					})}
				</div>

				{isOpenAfter && (
					<div className={clsx(styles.goldValue)}>
						<NumberFlow className={styles.goldText} value={animatedGold} format={{ maximumFractionDigits: 0 }} />
					</div>
				)}
			</div>
		</div>
	);
};

export default BossItem;

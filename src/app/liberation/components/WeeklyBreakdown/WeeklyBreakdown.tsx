'use client';

import Image from 'next/image';

import { weaponQuestsImagesSrc } from '@data/liberation/liberationQuests';

import styles from './WeeklyBreakdown.module.scss';

import type { Boss, WeeklyMonthlyPoints } from '@data/liberation/liberationBosses';
import type { JSX } from 'react';

type Props = {
	bosses: Boss[];
	weeklyMonthlyPoints: WeeklyMonthlyPoints;
	type: string;
};

const hasPoints = (
	value: WeeklyMonthlyPoints['bosses'][string] | undefined,
): value is { points: number; reset: string } => value !== undefined && 'points' in value;

const hasErionBattle = (
	value: WeeklyMonthlyPoints['bosses'][string] | undefined,
): value is { erion: number; battle: number; reset: string } => value !== undefined && 'erion' in value;

const IMAGE_SIZE = 32;

const WeeklyBreakdown = ({ bosses, weeklyMonthlyPoints, type }: Props): JSX.Element => {
	const title =
		type === 'Genesis'
			? 'Weekly Traces Breakdown'
			: type === 'Destiny'
				? 'Weekly Determination Breakdown'
				: 'Weekly Vestiges and Traces Breakdown';

	return (
		<div className={styles.mainDiv}>
			<p className={styles.title}>{title}</p>

			{bosses.map((boss) => {
				const bossStats = weeklyMonthlyPoints.bosses[boss.name];

				return (
					<div className={styles.line} key={boss.name}>
						<Image alt={`${boss.name} image`} height={56} priority src={boss.img} width={56} />

						<div className={styles.text}>
							<p>{boss.name}</p>

							<div className={styles.textValue}>
								{hasPoints(bossStats) ? (
									<>
										<Image
											alt={`${type} currency`}
											height={IMAGE_SIZE}
											src={weaponQuestsImagesSrc[type.toLocaleLowerCase()]}
											width={IMAGE_SIZE}
										/>
										<p className={styles.currencyText}>
											{bossStats.points}
											{bossStats.reset === 'Monthly' ? ' per month' : ''}
										</p>
									</>
								) : hasErionBattle(bossStats) ? (
									<>
										<Image
											alt="Erion"
											height={IMAGE_SIZE}
											src={weaponQuestsImagesSrc['astra_erion']}
											width={IMAGE_SIZE}
										/>
										<p className={styles.currencyText}>{bossStats.erion}</p>

										<Image
											alt="Battle"
											height={IMAGE_SIZE}
											src={weaponQuestsImagesSrc['astra_battle']}
											width={IMAGE_SIZE}
										/>
										<p className={styles.currencyText}>{bossStats.battle}</p>
									</>
								) : (
									<p>0</p>
								)}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default WeeklyBreakdown;

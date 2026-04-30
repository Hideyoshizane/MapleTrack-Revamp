'use client';

import Image from 'next/image';

import styles from './weeklyBreakdown.module.scss';

import type { Boss, WeeklyMonthlyPoints } from '@data/liberation/liberationBosses';
import type { JSX } from 'react';

type Props = {
	bosses: Boss[];
	weeklyMonthlyPoints: WeeklyMonthlyPoints;
	type: string;
};

const WeeklyBreakdown = ({ bosses, weeklyMonthlyPoints, type }: Props): JSX.Element => {
	const text = type == 'Genesis' ? 'Traces' : 'Determination';

	return (
		<div className={styles.mainDiv}>
			<p className={styles.title}>Weekly {text} Breakdown</p>

			{bosses.map((boss) => {
				const bossStats = weeklyMonthlyPoints.bosses[boss.name];

				return (
					<div className={styles.line} key={boss.name}>
						<Image alt={`${boss.name} image`} height={56} priority src={boss.img} width={56} />

						<div className={styles.text}>
							<p>{boss.name}</p>

							<p>
								{bossStats?.points ?? 0} {bossStats?.reset === 'Monthly' && 'per month'}
							</p>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default WeeklyBreakdown;

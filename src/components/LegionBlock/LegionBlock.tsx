'use client';

import Image from 'next/image';

import Tooltip from '@components/Tooltip/Tooltip';
import { getLegionData } from '@data/legion/legionSystems';
import { getRank } from '@utils/legion/getRank';

import styles from './LegionBlock.module.scss';

import type { JSX } from 'react';

interface LegionBlockProps {
	characterLevel: number;
	characterCode: string;
	characterJobType: string;
	characterLegionType: string;
	iconSize?: number;
	showTooltip?: boolean;
}

const RANK_MAP: Record<string, string> = {
	rank_b: 'B',
	rank_a: 'A',
	rank_s: 'S',
	rank_ss: 'SS',
	rank_sss: 'SSS',
};

const normalizeRank = (rank: string): string => RANK_MAP[rank] ?? 'no_rank';

const getTooltipContent = (legionRank: string, legionData: ReturnType<typeof getLegionData>): JSX.Element => {
	if (!legionData?.ranking) return <p>No bonus available</p>;

	const normalizedRank = normalizeRank(legionRank);

	return (
		<div>
			{legionData.ranking.map((entry): JSX.Element => {
				const isActive = entry.rank === normalizedRank;

				return (
					<p key={entry.rank} className={isActive ? styles.activeEntry : styles.entry}>
						{entry.description}
					</p>
				);
			})}
		</div>
	);
};

const LegionBlock = ({
	characterLevel,
	characterCode,
	characterJobType,
	characterLegionType,
	iconSize = 48,
	showTooltip = false,
}: LegionBlockProps): JSX.Element => {
	const legionRank = getRank(characterLevel, characterCode);
	const legionData = getLegionData(characterLegionType);
	const tooltipContent = getTooltipContent(legionRank, legionData);

	const imageSrc =
		legionRank === 'no_rank'
			? '/assets/legion/no_rank.webp'
			: `/assets/legion/${characterJobType === 'xenon' ? 'xenon' : characterJobType}/${legionRank}.webp`;

	const content = (
		<div className={styles.iconDiv}>
			<p className={showTooltip ? styles.iconDivText : styles.iconDivTextWhite}>Legion:</p>
			<Image
				src={imageSrc}
				width={iconSize}
				height={iconSize}
				quality={100}
				alt={`${characterJobType} legion ${legionRank} Icon`}
			/>
		</div>
	);

	return (
		<Tooltip content={tooltipContent} placement="bottom" enabled={showTooltip}>
			{content}
		</Tooltip>
	);
};

export default LegionBlock;

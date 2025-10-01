'use client';

import Image from 'next/image';
import React from 'react';

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

const normalizeRank = (rank: string): string => {
	switch (rank) {
		case 'rank_b':
			return 'B';
		case 'rank_a':
			return 'A';
		case 'rank_s':
			return 'S';
		case 'rank_ss':
			return 'SS';
		case 'rank_sss':
			return 'SSS';
		default:
			return 'no_rank';
	}
};

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

const LegionBlock: React.FC<LegionBlockProps> = ({
	characterLevel,
	characterCode,
	characterJobType,
	characterLegionType,
	iconSize = 48,
	showTooltip = false,
}): JSX.Element => {
	const legionRank = getRank(characterLevel, characterCode);
	const legionData = getLegionData(characterLegionType);

	const tooltipContent = getTooltipContent(legionRank, legionData);

	const getImageSrc = (): string => {
		if (legionRank === 'no_rank') return '/assets/legion/no_rank.webp';
		const jobFolder = characterJobType === 'xenon' ? 'xenon' : characterJobType;
		return `/assets/legion/${jobFolder}/${legionRank}.webp`;
	};

	const content = (
		<div className={styles.iconDiv}>
			<p className={showTooltip ? styles.iconDivText : styles.iconDivTextWhite}>Legion:</p>
			<Image
				src={getImageSrc()}
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

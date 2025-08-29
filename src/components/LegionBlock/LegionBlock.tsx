'use client';

import { clsx } from 'clsx';
import Image from 'next/image';
import React from 'react';

import { getRank } from '@/utils/legion/getRank';
import { getLegionData } from '@data/legion/legionSystems';

import Tooltip from '../Tooltip/Tooltip';

import styles from './LegionBlock.module.css';

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

const TooltipData = (legionRank: string, legionData: ReturnType<typeof getLegionData>) => {
	if (!legionData?.ranking) return 'No bonus available';

	const normalizedRank = normalizeRank(legionRank);

	return (
		<div>
			{legionData.ranking.map((entry) => (
				<p key={entry.rank}>{entry.rank === normalizedRank ? <b>{entry.description}</b> : entry.description}</p>
			))}
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
}) => {
	const legionRank = getRank(characterLevel, characterCode);
	const LegionData = getLegionData(characterLegionType);

	const tooltipContent = TooltipData(legionRank, LegionData);

	const getImageSrc = (): string => {
		if (legionRank === 'no_rank') {
			return '/assets/legion/no_rank.webp';
		}
		if (characterJobType === 'xenon') {
			return `/assets/legion/xenon/${legionRank}.webp`;
		}
		return `/assets/legion/${characterJobType}/${legionRank}.webp`;
	};

	const content = (
		<div className={styles.iconDiv}>
			<p
				className={clsx({
					[styles.iconDivText]: showTooltip,
					[styles.iconDivTextWhite]: !showTooltip,
				})}>
				Legion:
			</p>
			<Image
				src={getImageSrc()}
				width={iconSize}
				height={iconSize}
				alt={`${characterJobType} legion ${legionRank} Icon`}
			/>
		</div>
	);

	return showTooltip ? (
		<Tooltip content={tooltipContent} placement="bottom">
			{content}
		</Tooltip>
	) : (
		content
	);
};

export default LegionBlock;

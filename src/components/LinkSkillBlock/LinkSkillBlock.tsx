'use client';

import { clsx } from 'clsx';
import Image from 'next/image';
import React from 'react';

import Tooltip from '@components/Tooltip/Tooltip';
import { getLinkSkillByName, getLinkSkillDescription } from '@data/linkSkill/linkSkill';

import styles from './LinkSkillBlock.module.scss';

import type { JSX } from 'react';

interface LinkSkillProps {
	characterLevel: number;
	characterLinkSkill: string;
	iconSize?: number;
	showTooltip?: boolean;
}

const LinkSkillBlock: React.FC<LinkSkillProps> = ({
	characterLevel,
	characterLinkSkill,
	iconSize = 48,
	showTooltip = false,
}): JSX.Element => {
	const linkSkill = characterLinkSkill ? getLinkSkillByName(characterLinkSkill) : null;

	if (!linkSkill) {
		return <></>;
	}

	const tooltipContent = linkSkill ? getLinkSkillDescription(linkSkill, characterLevel) : '';

	const content = (
		<div className={styles.iconDiv}>
			<p
				className={clsx({
					[styles.iconDivText]: showTooltip,
					[styles.iconDivTextWhite]: !showTooltip,
				})}>
				Link Skill:
			</p>
			<Image src={linkSkill.image} width={iconSize} height={iconSize} quality={100} alt={linkSkill.name} />
		</div>
	);

	return (
		<Tooltip content={tooltipContent} placement="bottom" enabled={showTooltip}>
			{content}
		</Tooltip>
	);
};

export default LinkSkillBlock;

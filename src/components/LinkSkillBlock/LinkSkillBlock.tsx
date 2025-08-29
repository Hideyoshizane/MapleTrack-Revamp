'use client';

import { clsx } from 'clsx';
import Image from 'next/image';
import React from 'react';

import { getLinkSkillByName, getLinkSkillDescription } from '@data/linkSkill/linkSkill';

import Tooltip from '../Tooltip/Tooltip';

import styles from './LinkSkillBlock.module.css';

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
}) => {
	const linkSkill = characterLinkSkill ? getLinkSkillByName(characterLinkSkill) : null;

	if (!linkSkill) {
		return null;
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
			<Image src={linkSkill.image} width={iconSize} height={iconSize} alt={linkSkill.name} />
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

export default LinkSkillBlock;

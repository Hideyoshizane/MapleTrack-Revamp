'use client';

import { clsx } from 'clsx';
import Image from 'next/image';

import Tooltip from '@components/Tooltip/tooltip';
import { getLinkSkillByName, getLinkSkillDescription } from '@data/linkSkill/linkSkill';

import styles from './linkSkillBlock.module.scss';

import type { JSX } from 'react';

type LinkSkillProps = {
	characterLevel: number;
	characterLinkSkill: string;
	iconSize?: number;
	showTooltip?: boolean;
};

const LinkSkillBlock = ({
	characterLevel,
	characterLinkSkill,
	iconSize = 48,
	showTooltip = false,
}: LinkSkillProps): JSX.Element | null => {
	const linkSkill = getLinkSkillByName(characterLinkSkill);

	if (!linkSkill) {
		return null;
	}

	const tooltipContent = getLinkSkillDescription(linkSkill, characterLevel);

	const content = (
		<div className={styles.iconDiv}>
			<p className={clsx(showTooltip ? styles.iconDivText : styles.iconDivTextWhite)}>Link Skill:</p>
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

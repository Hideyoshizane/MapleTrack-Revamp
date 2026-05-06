'use client';

import { clsx } from 'clsx';
import Image from 'next/image';

import Tooltip from '@components/Tooltip/Tooltip';
import { getLinkSkillByName, getLinkSkillDescription } from '@data/linkSkill/linkSkill';

import styles from './LinkSkillBlock.module.scss';

import type { JSX } from 'react';

type Props = {
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
}: Props): JSX.Element | null => {
	const linkSkill = getLinkSkillByName(characterLinkSkill);
	if (!linkSkill) {
		return null;
	}

	const tooltipContent = getLinkSkillDescription(linkSkill, characterLevel);

	const content = (
		<div className={styles.iconDiv}>
			<p className={clsx(showTooltip ? styles.iconDivText : styles.iconDivTextWhite)}>Link Skill:</p>

			<Image alt={linkSkill.name} height={iconSize} quality={100} src={linkSkill.image} width={iconSize} />
		</div>
	);

	return (
		<Tooltip content={tooltipContent} enabled={showTooltip} placement="bottom">
			{content}
		</Tooltip>
	);
};

export default LinkSkillBlock;

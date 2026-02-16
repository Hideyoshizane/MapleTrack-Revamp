'use client';

import { clsx } from 'clsx';

import BossIcon from '@assets/svg/boss_slayer.svg';
import LegionBlock from '@components/LegionBlock/LegionBlock';
import LinkSkillBlock from '@components/LinkSkillBlock/LinkSkillBlock';
import Tooltip from '@components/Tooltip/Tooltip';

import styles from './CharacterBossLegion.module.scss';

import type { JobType } from '@components/ProgressBar/ProgressBar';
import type { CharacterDraft as Character } from '@features/character/characterModel';
import type { JSX } from 'react';

const BOSS_ICON_SIZE = 90;
const ICON_SIZE = 64;

type CharacterBossLegionProps = {
	character: Character;
	toggleBossing: () => void;
	linkSkill: string;
	code: string;
	jobType: JobType;
	legion: string;
};

const CharacterBossLegion = ({
	character,
	toggleBossing,
	linkSkill,
	code,
	jobType,
	legion,
}: CharacterBossLegionProps): JSX.Element => (
	<div className={styles.characterBossLinkLegion}>
		<div className={styles.bossSlot}>
			<Tooltip content="Click to toggle Boss Slayer status" placement="bottom">
				<div
					role="button"
					tabIndex={0}
					onClick={toggleBossing}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							toggleBossing();
						}
					}}
					style={{ cursor: 'pointer' }}>
					<BossIcon
						width={BOSS_ICON_SIZE}
						height={BOSS_ICON_SIZE}
						className={clsx(styles.bossIcon, {
							[styles.on]: character.bossing,
							[styles.off]: !character.bossing,
						})}
					/>
				</div>
			</Tooltip>
		</div>
		<LinkSkillBlock characterLevel={character.level} characterLinkSkill={linkSkill} iconSize={ICON_SIZE} showTooltip />
		<LegionBlock
			characterLevel={character.level}
			characterCode={code}
			characterJobType={jobType}
			characterLegionType={legion}
			iconSize={ICON_SIZE}
			showTooltip
		/>
	</div>
);

export default CharacterBossLegion;

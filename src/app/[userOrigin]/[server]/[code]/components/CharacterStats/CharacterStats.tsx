'use client';

import BossIcon from '@assets/svg/boss_slayer.svg';
import LegionBlock from '@components/LegionBlock/LegionBlock';
import LinkSkillBlock from '@components/LinkSkillBlock/LinkSkillBlock';
import ProgressBar from '@components/ProgressBar/ProgressBar';

import styles from './CharacterStats.module.scss';

import type { JobType } from '@components/ProgressBar/ProgressBar';
import type { CharacterDocument } from '@models/character';
import type { JSX } from 'react';

interface CharacterStatsProps {
	character: CharacterDocument;
	job: string;
	jobType: JobType;
}

const BOSS_ICON_SIZE = 90;
const ICON_SIZE = 64;

const CharacterStats = ({ character, job, jobType }: CharacterStatsProps): JSX.Element => {
	const { level, targetLevel, bossing, linkSkill, code, jobType: charJobType, legion, class: charClass } = character;
	return (
		<>
			<div className={styles.bigBlock}>
				<div className={styles.characterBossLinkLegion}>
					<div className={styles.bossSlot}>
						{bossing ? <BossIcon width={BOSS_ICON_SIZE} height={BOSS_ICON_SIZE} className={styles.bossIcon} /> : <></>}
					</div>

					<LinkSkillBlock
						characterLevel={level}
						characterLinkSkill={linkSkill ?? ''}
						iconSize={ICON_SIZE}
						showTooltip={true}
					/>

					<LegionBlock
						characterLevel={level}
						characterCode={code ?? ''}
						characterJobType={charJobType ?? 'default'}
						characterLegionType={legion ?? 'none'}
						iconSize={ICON_SIZE}
						showTooltip={true}
					/>
				</div>

				<div className={styles.characterClassJob}>
					<p className={styles.characterClass}>{charClass}</p>
					<p className={styles.characterJob}>{job}</p>
				</div>
			</div>

			<div className={styles.levelDiv}>
				<div className={styles.levelInput}>
					<p className={styles.levelText}>Level:</p>
					<p className={styles.levelTextBlack}>
						{level}/{targetLevel}
					</p>
				</div>

				<ProgressBar height={32} width={900} value={level} maxValue={targetLevel} jobType={jobType} />
			</div>
		</>
	);
};

export default CharacterStats;

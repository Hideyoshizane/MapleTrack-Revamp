'use client';

import BossIcon from '@assets/svg/boss_slayer.svg';
import LegionBlock from '@components/LegionBlock/LegionBlock';
import LinkSkillBlock from '@components/LinkSkillBlock/LinkSkillBlock';
import ProgressBar from '@components/ProgressBar/ProgressBar';
import { generateClassCode } from '@data/classes/classes';

import styles from './CharacterStats.module.scss';

import type { JobType } from '@components/ProgressBar/ProgressBar';
import type { getCharacterDataResponseBody } from '@features/character/schemas/character.response.schema';
import type { JSX } from 'react';

type Props = {
	character: getCharacterDataResponseBody;
	job: string;
	jobType: JobType;
};

const BOSS_ICON_SIZE = 90;
const ICON_SIZE = 64;

const CharacterStats = ({ character, job, jobType }: Props): JSX.Element => {
	const { level, targetLevel, bossing, linkSkill, jobType: charJobType, legion, class: charClass } = character;
	return (
		<>
			<div className={styles.bigBlock}>
				<div className={styles.characterBossLinkLegion}>
					<div className={styles.bossSlot}>
						{bossing && <BossIcon className={styles.bossIcon} height={BOSS_ICON_SIZE} width={BOSS_ICON_SIZE} />}
					</div>

					<LinkSkillBlock
						characterLevel={level}
						characterLinkSkill={linkSkill ?? ''}
						iconSize={ICON_SIZE}
						showTooltip={true}
					/>

					<LegionBlock
						characterCode={generateClassCode(charClass ?? '')}
						characterJobType={charJobType ?? 'default'}
						characterLegionType={legion ?? 'none'}
						characterLevel={level}
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

				<ProgressBar height={32} jobType={jobType} maxValue={targetLevel} value={level} width={900} />
			</div>
		</>
	);
};

export default CharacterStats;

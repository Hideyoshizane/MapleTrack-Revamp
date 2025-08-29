'use client';

import { clsx } from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { Textfit } from 'react-textfit';

import { getJob } from '@/utils/jobs/getJob';
import BossIcon from '@assets/svg/boss_slayer.svg';
import LegionBlock from '@components/LegionBlock/LegionBlock';
import LinkSkillBlock from '@components/LinkSkillBlock/LinkSkillBlock';
import ProgressBar, { JobType } from '@components/ProgressBar/ProgressBar';
import { SkeletonWrapper } from '@components/SkeletonWrapper/SkeletonWrapper';
import { getLinkSkillByName } from '@data/linkSkill/linkSkill';
import { getLastLevel } from '@data/symbols/exp/expTable';
import { getSymbolImagePath, canUseSymbol, SymbolName } from '@data/symbols/symbolMappings';

import styles from './ClassCard.module.css';

import type { CharacterDocument } from '@models/character';

interface ClassCardProps {
	character: CharacterDocument;
}

interface SymbolProps {
	type: 'arcane' | 'sacred';
	symbols: { name: string; level: number }[];
	maxLevel: number;
	size?: number;
}

// Subcomponent: renders Arcane/Sacred symbols
const SymbolGrid = ({ symbols, maxLevel, size = 24 }: SymbolProps) => (
	<div className={styles.symbolGrid}>
		{symbols.map((symbol, index) => {
			const usable = canUseSymbol(symbol.level, symbol.name);
			const displayLevel = usable ? (symbol.level < maxLevel ? `Lv. ${symbol.level}` : 'MAX') : 'Lv. 0';

			return (
				<div key={index} className={styles.symbolsLine}>
					<Image
						src={getSymbolImagePath(symbol.name as SymbolName)}
						width={size}
						height={size}
						alt={`${symbol.name} Icon`}
						className={!usable ? styles.off : ''}
						loading="lazy"
					/>
					<p className={styles.symbolLevel}>{displayLevel}</p>
				</div>
			);
		})}
	</div>
);

// Subcomponent: renders Link Skill & Legion icons
const IconSection = ({
	character,
	iconSize = 48,
}: {
	linkSkill: { name: string; image: string } | null;
	character: {
		linkSkill: string;
		level: number;
		code?: string;
		jobType?: string;
		legion?: string;
	};
	iconSize?: number;
}) => (
	<div className={styles.bottomHalfIcon}>
		<LinkSkillBlock characterLevel={character.level} characterLinkSkill={character.linkSkill} iconSize={iconSize} />
		<LegionBlock
			characterLevel={character.level}
			characterCode={character.code!}
			characterJobType={character.jobType!}
			characterLegionType={character.legion!}
			iconSize={iconSize}
		/>
	</div>
);

export default function ClassCard({ character }: ClassCardProps) {
	if (!character) {
		// Return early to avoid runtime errors
		return <SkeletonWrapper width={256} height={56} color="light" variant="rectangular" />;
	}
	const SYMBOL_SIZE = 24;
	const BOSS_ICON_SIZE = 48;

	const arcaneMaxLevel = getLastLevel('arcane');
	const sacredMaxLevel = getLastLevel('sacred');

	const LinkSkill: { name: string; image: string } | null = character.linkSkill
		? getLinkSkillByName(character.linkSkill)!
		: null;

	const job = getJob(character.level);
	const jobType: JobType = (character.jobType ?? 'default') as JobType;

	const jobLevelClassMap: Record<JobType, string> = {
		default: styles.defaultLevel,
		mage: styles.mageLevel,
		warrior: styles.warriorLevel,
		bowman: styles.bowmanLevel,
		thief: styles.thiefLevel,
		xenon: styles.xenonLevel,
		pirate: styles.pirateLevel,
		complete: styles.complete,
	};

	return (
		<Link href={`/${character.userOrigin}/${character.server}/${character.code}`} passHref>
			<div className={styles.cardBody}>
				{/* Top section: Symbols + Class Image */}
				<div className={styles.topPart}>
					<div className={styles.symbolsDiv}>
						<p className={styles.title}>Arcane Symbol</p>
						<SymbolGrid type="arcane" symbols={character.ArcaneSymbol} maxLevel={arcaneMaxLevel} size={SYMBOL_SIZE} />

						<p className={styles.title}>Sacred Symbol</p>
						<SymbolGrid type="sacred" symbols={character.SacredSymbol} maxLevel={sacredMaxLevel} size={SYMBOL_SIZE} />
					</div>
					<Image
						src={`/assets/cards/${character.code}.webp`}
						width={355}
						height={213}
						priority
						alt={`${character.class} class Icon`}
						className={clsx(styles.classImg, character.level === 0 && styles.cardOff)}
					/>
				</div>

				{/* Bottom section: Link Skill, Legion, Boss, Name */}
				<div className={styles.bottomPart}>
					<IconSection
						linkSkill={LinkSkill}
						character={{
							linkSkill: character.linkSkill!,
							level: character.level,
							code: character.code!,
							jobType: character.jobType!,
							legion: character.legion!,
						}}
					/>
					<div className={styles.bottomHalf}>
						{character.bossing && (
							<BossIcon width={BOSS_ICON_SIZE} height={BOSS_ICON_SIZE} className={styles.bossIcon} />
						)}
						<div className={styles.characterNameJobDiv}>
							<Textfit className={styles.characterName} max={24} min={12}>
								{character.name}
							</Textfit>
							<p className={styles.characterJob}>{job}</p>
						</div>
					</div>
				</div>

				{/* Level and ProgressBar */}
				<div className={styles.levelPart}>
					<p
						className={clsx(styles.levelText, jobLevelClassMap[jobType], {
							[styles.complete]: character.level >= character.targetLevel,
						})}>
						{character.level}/{character.targetLevel}
					</p>
					<ProgressBar
						height={24}
						width={486}
						value={character.level}
						maxValue={character.targetLevel}
						jobType={jobType}
					/>
				</div>
			</div>
		</Link>
	);
}

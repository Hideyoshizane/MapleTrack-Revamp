'use client';
import { clsx } from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import BossIcon from '@assets/svg/boss_slayer.svg';
import LegionBlock from '@components/LegionBlock/LegionBlock';
import LinkSkillBlock from '@components/LinkSkillBlock/LinkSkillBlock';
import ProgressBar from '@components/ProgressBar/ProgressBar';
import ResponsiveText from '@components/ResponsiveText/ResponsiveText';
import { getLinkSkillByName } from '@data/linkSkill/linkSkill';
import { getLastLevel } from '@data/symbols/exp/expTable';
import { toSymbolName, getSymbolImagePath, canUseSymbol } from '@data/symbols/symbolMappings';
import { separateSymbolsByCategory, getJob } from '@features/character/characterAttributes';

import styles from './ClassCard.module.scss';

import type { JobType } from '@components/ProgressBar/ProgressBar';
import type { SymbolName } from '@data/symbols/symbolMappings';
import type { CharacterDraft as Character } from '@features/character/characterModel';
import type { JSX } from 'react';

type ClassCardProps = {
	character: Character;
};

type SymbolProps = {
	type: 'arcane' | 'sacred';
	symbols: { name: string; level: number }[];
	maxLevel: number;
	size?: number;
	characterLevel: number;
};

// Map JobType to class for conditional styles
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

// Subcomponent: renders Arcane/Sacred symbols in a grid
const SymbolGrid = ({ symbols, maxLevel, size = 16, characterLevel }: SymbolProps): JSX.Element => (
	<div className={styles.symbolGrid}>
		{symbols.map((symbol, index): JSX.Element => {
			const symbolName = toSymbolName(symbol.name);

			const usable = symbolName !== null && canUseSymbol(characterLevel, symbolName);
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

// Bottom section: Link Skill + Legion
const IconSection = ({
	character,
	iconSize = 48,
}: {
	linkSkill: { name: string; image: string } | null;
	character: { linkSkill: string; level: number; code: string; jobType: string; legion: string };
	iconSize?: number;
}): JSX.Element => (
	<div className={styles.bottomHalfIcon}>
		<LinkSkillBlock characterLevel={character.level} characterLinkSkill={character.linkSkill} iconSize={iconSize} />
		<LegionBlock
			characterLevel={character.level}
			characterCode={character.code === 'zero' ? 'zero' : 'default'}
			characterJobType={character.jobType}
			characterLegionType={character.legion}
			iconSize={iconSize}
		/>
	</div>
);

const ClassCard = ({ character }: ClassCardProps): JSX.Element | null => {
	const router = useRouter();

	if (!character?.code || !character.jobType || !character.legion) {
		router.replace('/error');
		return null;
	}

	const {
		code,
		jobType,
		legion,
		linkSkill: ls,
		level,
		name,
		bossing,
		targetLevel,
		server,
		class: className,
	} = character;

	const { arcane: ArcaneSymbol, sacred: SacredSymbol } = separateSymbolsByCategory(character.symbols);

	const SYMBOL_SIZE = 20;
	const BOSS_ICON_SIZE = 48;

	const arcaneMaxLevel = getLastLevel('arcane');
	const sacredMaxLevel = getLastLevel('sacred');

	const linkSkill = ls ? (getLinkSkillByName(ls) ?? null) : null;

	const jobKey: JobType = (jobType ?? 'default') as JobType;
	const job: string = getJob(character.level);

	return (
		<Link href={`/${server}/${code}`} passHref>
			<div className={styles.cardBody}>
				{/* Top section */}
				<div className={styles.topPart}>
					<div className={styles.symbolsDiv}>
						<p className={styles.title}>Arcane Symbol</p>
						<SymbolGrid
							type="arcane"
							symbols={ArcaneSymbol}
							maxLevel={arcaneMaxLevel}
							size={SYMBOL_SIZE}
							characterLevel={character.level}
						/>

						<p className={styles.title}>Sacred Symbol</p>
						<SymbolGrid
							type="sacred"
							symbols={SacredSymbol}
							maxLevel={sacredMaxLevel}
							size={SYMBOL_SIZE}
							characterLevel={character.level}
						/>
					</div>

					<Image
						src={`/assets/cards/${code}.webp`}
						width={355}
						height={213}
						priority
						alt={`${className} class Icon`}
						className={clsx(styles.classImg, level === 0 && styles.cardOff)}
					/>
				</div>

				{/* Bottom section: Link Skill, Legion, Boss, Name */}
				<div className={styles.bottomPart}>
					<IconSection linkSkill={linkSkill} character={{ linkSkill: ls ?? '', level, code, jobType, legion }} />

					<div className={styles.bottomHalf}>
						{bossing && <BossIcon width={BOSS_ICON_SIZE} height={BOSS_ICON_SIZE} className={styles.bossIcon} />}
						<div className={styles.characterNameJobDiv}>
							<ResponsiveText
								className={styles.characterName}
								width={180}
								height={36}
								maxFontSize={28}
								minFontSize={12}>
								{name}
							</ResponsiveText>
							<p className={styles.characterJob}>{job}</p>
						</div>
					</div>
				</div>

				{/* Level and ProgressBar */}
				<div className={styles.levelPart}>
					<p className={clsx(styles.levelText, jobLevelClassMap[jobKey], { [styles.complete]: level >= targetLevel })}>
						{level}/{targetLevel}
					</p>
					<ProgressBar height={24} width={486} value={level} maxValue={targetLevel} jobType={jobKey} />
				</div>
			</div>
		</Link>
	);
};

export default ClassCard;

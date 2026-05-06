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
import { generateClassCode } from '@data/classes/classes';
import { getLinkSkillByName } from '@data/linkSkill/linkSkill';
import { getLastLevel } from '@data/symbols/exp/expTable';
import { toSymbolName, getSymbolImagePath, canUseSymbol } from '@data/symbols/symbolMappings';
import { getJob } from '@features/character/characterService';

import styles from './ClassCard.module.scss';

import type { JobType } from '@components/ProgressBar/ProgressBar';
import type { SymbolName } from '@data/symbols/symbolMappings';
import type { getAllCharactersResponseBody } from '@features/character/schemas/character.response.schema';
import type { JSX } from 'react';

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

type SymbolProps = {
	type: 'arcane' | 'sacred';
	symbols: { name: string; level: number }[];
	maxLevel: number;
	size?: number;
	characterLevel: number;
};

// Subcomponent: renders Arcane/Sacred symbols in a grid
const SymbolGrid = ({ symbols, maxLevel, size = 16, characterLevel }: SymbolProps): JSX.Element => (
	<div className={styles.symbolGrid}>
		{symbols.map((symbol): JSX.Element => {
			const symbolName = toSymbolName(symbol.name);

			const usable = symbolName !== null && canUseSymbol(characterLevel, symbolName);
			const displayLevel = usable ? (symbol.level < maxLevel ? `Lv. ${symbol.level}` : 'MAX') : 'Lv. 0';

			return (
				<div className={styles.symbolsLine} key={symbol.name}>
					<Image
						className={!usable ? styles.off : ''}
						alt={`${symbol.name} Icon`}
						height={size}
						loading="lazy"
						src={getSymbolImagePath(symbol.name as SymbolName)}
						width={size}
					/>
					<p className={styles.symbolLevel}>{displayLevel}</p>
				</div>
			);
		})}
	</div>
);

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
			characterCode={character.code === 'zero' ? 'zero' : 'default'}
			characterJobType={character.jobType}
			characterLegionType={character.legion}
			characterLevel={character.level}
			iconSize={iconSize}
		/>
	</div>
);

type Props = {
	character: getAllCharactersResponseBody;
	serverCookie: string | undefined;
};

const ClassCard = ({ character, serverCookie }: Props): JSX.Element | null => {
	const router = useRouter();

	if (!character.jobType || !character.legion) {
		router.replace('/error');

		return null;
	}

	const { jobType, legion, linkSkill: ls, level, name, bossing, targetLevel, class: className, symbols } = character;

	const SYMBOL_SIZE = 20;
	const BOSS_ICON_SIZE = 48;

	const arcaneMaxLevel = getLastLevel('arcane');
	const sacredMaxLevel = getLastLevel('sacred');

	const linkSkill = ls ? (getLinkSkillByName(ls) ?? null) : null;

	const jobKey: JobType = (jobType ?? 'default') as JobType;
	const job: string = getJob(character.level);
	const code: string = generateClassCode(character.class ?? '');

	return (
		<Link href={`/${serverCookie}/${code}`} passHref>
			<div className={styles.cardBody}>
				{/* Top section */}
				<div className={styles.topPart}>
					<div className={styles.symbolsDiv}>
						<p className={styles.title}>Arcane Symbol</p>
						<SymbolGrid
							characterLevel={character.level}
							maxLevel={arcaneMaxLevel}
							size={SYMBOL_SIZE}
							symbols={symbols.arcane}
							type="arcane"
						/>

						<p className={styles.title}>Sacred Symbol</p>
						<SymbolGrid
							characterLevel={character.level}
							maxLevel={sacredMaxLevel}
							size={SYMBOL_SIZE}
							symbols={symbols.sacred}
							type="sacred"
						/>
					</div>

					<Image
						className={clsx(styles.classImg, level === 0 && styles.cardOff)}
						alt={`${className} class Icon`}
						height={213}
						priority
						src={`/assets/cards/${code}.webp`}
						width={355}
					/>
				</div>

				{/* Bottom section: Link Skill, Legion, Boss, Name */}
				<div className={styles.bottomPart}>
					<IconSection character={{ linkSkill: ls ?? '', level, code, jobType, legion }} linkSkill={linkSkill} />

					<div className={styles.bottomHalf}>
						{bossing && <BossIcon className={styles.bossIcon} height={BOSS_ICON_SIZE} width={BOSS_ICON_SIZE} />}
						<div className={styles.characterNameJobDiv}>
							<ResponsiveText
								className={styles.characterName}
								height={36}
								maxFontSize={28}
								minFontSize={12}
								width={180}>
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
					<ProgressBar height={24} jobType={jobKey} maxValue={targetLevel} value={level} width={486} />
				</div>
			</div>
		</Link>
	);
};

export default ClassCard;

'use client';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import LegionBlock from '@/components/LegionBlock/LegionBlock';
import LinkSkillBlock from '@/components/LinkSkillBlock/LinkSkillBlock';
import SymbolGrid from '@/components/SymbolGrid/SymbolGrid';
import { GetCharacterDataRequestBody, GetCharacterDataApiResponse, ExtraCharacterData } from '@/shared/types/character';
import { getJob } from '@/utils/jobs/getJob';
import BossIcon from '@assets/svg/boss_slayer.svg';
import Button from '@components/Button/Button';
import ProgressBar, { JobType } from '@components/ProgressBar/ProgressBar';
import { SkeletonWrapper } from '@components/SkeletonWrapper/SkeletonWrapper';
import { CharacterDocument } from '@models/character';
import { fetchWithTimeout } from '@utils/fetch/withTimeout';

import DropdownEventMenu from './DropdownEventMenu/DropdownEventMenu';
import styles from './page.module.css';

async function fetchCharacterApi(payload: GetCharacterDataRequestBody): Promise<GetCharacterDataApiResponse> {
	const res = await fetchWithTimeout('/api/characters/getCharacterData', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});

	return (await res.json()) as GetCharacterDataApiResponse;
}

export default function HomePageClient() {
	const params = useParams();

	const [character, setCharacter] = useState<CharacterDocument>();
	const [extraData, setExtraData] = useState<ExtraCharacterData | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	const username = Array.isArray(params.userOrigin) ? params.userOrigin[0] : params.userOrigin;
	const serverName = Array.isArray(params.server) ? params.server[0] : params.server;
	const charCode = Array.isArray(params.code) ? params.code[0] : params.code;

	useEffect(() => {
		if (!username || !serverName || !charCode) return;

		// Async function inside useEffect
		const fetchData = async () => {
			try {
				const data = await fetchCharacterApi({
					userOrigin: username,
					server: serverName,
					code: charCode,
				});

				if (data.success) {
					setCharacter(data.data);
				} else {
					setError(data.error);
				}
			} catch (err: unknown) {
				console.error('Error fetching characters:', err);
			} finally {
				setLoading(false);
			}
		};

		void fetchData();
	}, [username, serverName, charCode]);

	useEffect(() => {
		if (!character) return;

		const fetchExtraData = async () => {
			try {
				const res = await fetch('/api/characters/getAPICharacterImage');
				if (!res.ok) throw new Error('Failed to fetch extra data');

				const extra: ExtraCharacterData = (await res.json()) as ExtraCharacterData;
				setExtraData(extra);
			} catch (err) {
				console.error('Error fetching extra character data:', err);
			}
		};

		void fetchExtraData();
	}, [character]);

	if (error) return <p>Error: {error}</p>;
	if (!character) return null;

	const job = getJob(character.level);
	const BOSS_ICON_SIZE = 90;
	const ICON_SIZE = 64;
	const jobType: JobType = (character.jobType ?? 'default') as JobType;

	return (
		<section className="mainContent">
			<div className={styles.mainDiv}>
				<Image
					src={`/assets/profile/${character.code}.webp`}
					width={650}
					height={827}
					priority
					alt={`${character.class} class profile Icon`}
				/>
				<div className={styles.characterContent}>
					<div className={styles.buttonLine}>
						<DropdownEventMenu />
						<Button className={styles.increaseAllButton}>Increase All</Button>
						<Button className={styles.editCharacterButton}>Edit Character</Button>
					</div>
					<div className={styles.usernameLine}>
						<div className={styles.characterImgDiv}>
							{character.syncing &&
								(extraData ? (
									<Image src={extraData.characterImgURL} alt="Fetched from API" width={80} height={80} />
								) : (
									<SkeletonWrapper width={80} height={80} color="light" variant="rectangular" />
								))}
						</div>
						<p className={styles.characterName}>{character.name}</p>
					</div>
					<div className={styles.bigBlock}>
						<div className={styles.characterBossLinkLegion}>
							<div className={styles.bossSlot}>
								{loading ? (
									<SkeletonWrapper width={BOSS_ICON_SIZE} height={BOSS_ICON_SIZE} color="light" variant="rectangular" />
								) : (
									character.bossing && (
										<BossIcon width={BOSS_ICON_SIZE} height={BOSS_ICON_SIZE} className={styles.bossIcon} />
									)
								)}
							</div>
							<LinkSkillBlock
								characterLevel={character.level}
								characterLinkSkill={character.linkSkill!}
								iconSize={ICON_SIZE}
								showTooltip={true}
							/>
							<LegionBlock
								characterLevel={character.level}
								characterCode={character.code!}
								characterJobType={character.jobType!}
								characterLegionType={character.legion!}
								iconSize={ICON_SIZE}
								showTooltip={true}
							/>
						</div>
						<div className={styles.characterClassJob}>
							<p className={styles.characterClass}>{character.class}</p>
							<p className={styles.characterJob}>{job}</p>
						</div>
					</div>
					<div className={styles.levelDiv}>
						<div className={styles.levelInput}>
							<p className={styles.levelText}>Level:</p>
							<p className={styles.levelTextBlack}>
								{character.level}/{character.targetLevel}
							</p>
						</div>

						<ProgressBar
							height={32}
							width={900}
							value={character.level}
							maxValue={character.targetLevel}
							jobType={jobType}
						/>
					</div>
					<div className={styles.symbols}>
						<p className={styles.title}>Arcane Symbols</p>
						<SymbolGrid
							type="arcane"
							symbols={character.ArcaneSymbol}
							characterLevel={character.level}
							characterJobType={character.jobType!}
							size={56}
						/>

						<p className={styles.title}>Sacred Symbols</p>
						<SymbolGrid
							type="sacred"
							symbols={character.SacredSymbol}
							characterLevel={character.level}
							characterJobType={character.jobType!}
							size={56}
						/>

						<p className={styles.title}>Grand Sacred Symbols</p>
						<SymbolGrid
							type="grand"
							symbols={character.GrandSacredSymbol}
							characterLevel={character.level}
							characterJobType={character.jobType!}
							size={56}
						/>
					</div>
				</div>
			</div>
		</section>
	);
}

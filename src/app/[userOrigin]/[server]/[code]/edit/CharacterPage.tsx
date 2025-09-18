'use client';
import { clsx } from 'clsx';
import Image from 'next/image';
import { notFound, useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import EditPageSymbolGrid from '@/components/EditPageSymbolGrid/EditPageSymbolGrid';
import LegionBlock from '@/components/LegionBlock/LegionBlock';
import LinkSkillBlock from '@/components/LinkSkillBlock/LinkSkillBlock';
import Loader from '@/components/Loader/Loader';
import Switch from '@/components/Switch/Switch';
import { sanitizeInputFrontend } from '@/utils/sanitize';
import BossIcon from '@assets/svg/boss_slayer.svg';
import ErrorIcon from '@assets/svg/circle-x.svg';
import Button from '@components/Button/Button';
import ProgressBar from '@components/ProgressBar/ProgressBar';
import { SkeletonWrapper } from '@components/SkeletonWrapper/SkeletonWrapper';
import Tooltip from '@components/Tooltip/Tooltip';
import { checkCharacterName } from '@schemas/characterNameSchema';
import { fetchWithTimeout } from '@utils/fetch/withTimeout';
import { getJob } from '@utils/jobs/getJob';

import styles from './page.module.css';

import type {
	GetCharacterDataRequestBody,
	GetCharacterDataApiResponse,
	ExtraCharacterData,
	GetExtraCharacterDataApiResponse,
} from '@/shared/types/character';
import type { JobClass } from '@/utils/jobs/getJob';
import type { JobType } from '@components/ProgressBar/ProgressBar';
import type { CharacterDocument } from '@models/character';
import type { ApiResponse } from '@sharedTypes/api/api';

interface CharacterPageProps {
	userOrigin: string;
	server: string;
	code: string;
}

const fetchCharacterApi = async (payload: GetCharacterDataRequestBody): Promise<GetCharacterDataApiResponse> => {
	const res = await fetchWithTimeout('/api/characters/getCharacterData', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});

	return (await res.json()) as GetCharacterDataApiResponse;
};

export default function CharacterPage({ userOrigin, server, code }: CharacterPageProps) {
	const router = useRouter();
	const pathname = usePathname();

	const [character, setCharacter] = useState<CharacterDocument>();
	const [editableCharacter, setEditableCharacter] = useState<Partial<CharacterDocument>>({});
	const [extraData, setExtraData] = useState<ExtraCharacterData | null>(null);
	const [extraDataFailed, setExtraDataFailed] = useState(false);

	// Local state for input value
	const [levelInput, setLevelInput] = useState<string>(character?.level?.toString() ?? '');
	const [targetLevelInput, setTargetLevelInput] = useState<string>(character?.targetLevel?.toString() ?? '');
	const [job, setJob] = useState<JobClass>('No Job');

	const [nameError, setNameError] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const [characterLoading, setCharacterLoading] = useState(true);
	const [extraDataLoading, setExtraDataLoading] = useState(false);
	const [isFirstLoad, setIsFirstLoad] = useState(true);
	const [committedName, setCommittedName] = useState<string | undefined>(character?.name);
	const [submitLoading, setSubmitLoading] = useState(false);

	// Fetch character
	useEffect(() => {
		if (!userOrigin || !server || !code) return;

		const fetchData = async () => {
			try {
				const data = await fetchCharacterApi({ userOrigin, server, code });

				if (data.success) {
					setCharacter(data.data);
				} else {
					setError(data.error ?? null);
				}
			} catch (err: unknown) {
				console.error('Error fetching characters:', err);
				setError('Failed to fetch character data');
			} finally {
				setCharacterLoading(false);
			}
		};

		void fetchData();
	}, [userOrigin, server, code]);

	// Run validation on mount
	useEffect(() => {
		if (!character) return;

		const value = editableCharacter.name ?? character?.name;
		if (!value) return;

		const error = checkCharacterName(value);
		setNameError(error);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [character]);

	// Update job whenever level changes
	useEffect(() => {
		const level = editableCharacter.level ?? character?.level;
		if (level) setJob(getJob(level));
	}, [editableCharacter.level, character]);

	useEffect(() => {
		const isSyncing = editableCharacter.syncing ?? character?.syncing;
		const charName = committedName ?? character?.name;

		// Clear previous state before refetch
		setExtraData(null);
		setExtraDataFailed(false);

		// Run only if syncing is enabled and character has a valid name
		if (!isSyncing || !charName) return;

		setExtraDataLoading(true);

		const fetchExtraData = async () => {
			try {
				const res = await fetch(`/api/characters/getAPICharacterImage?character_name=${charName}&server=${server}`);

				if (!res.ok) {
					setExtraDataFailed(true);
					return;
				}

				const apiResponse: GetExtraCharacterDataApiResponse = await res.json();

				if (apiResponse.success && apiResponse.data) {
					setExtraData(apiResponse.data);
					setExtraDataFailed(false);
				} else {
					setExtraDataFailed(true);
				}
			} catch (err) {
				console.error('Error fetching extra character data', err);
				setExtraDataFailed(true);
			} finally {
				setExtraDataLoading(false);
			}
		};

		void fetchExtraData();
	}, [editableCharacter.syncing, committedName, character?.syncing, character?.name, server]);

	// Unified loading
	const loading = isFirstLoad && (characterLoading || extraDataLoading);

	useEffect(() => {
		if (!characterLoading && !extraDataLoading && isFirstLoad) {
			setIsFirstLoad(false);
		}
	}, [characterLoading, extraDataLoading, isFirstLoad]);

	if (error) {
		throw new Error(error);
	}

	if (loading) {
		return (
			<section className="mainContent">
				<div className={styles.mainDiv}>
					<div className={styles.loaderDiv}>
						<Loader width={120} height={120} color={'var(--default-black)'} borderWidth={12} />
					</div>
				</div>
			</section>
		);
	}

	if (!character) {
		notFound();
	}

	// Fallback helper values
	const safeCharacter = character;

	const level = editableCharacter.level ?? safeCharacter.level;
	const targetLevel = editableCharacter.targetLevel ?? safeCharacter.targetLevel;
	const jobType: JobType = (editableCharacter.jobType ?? safeCharacter.jobType ?? 'default') as JobType;
	const charClass = editableCharacter.class ?? safeCharacter.class;
	const codeChar = editableCharacter.code ?? safeCharacter.code ?? '';
	const legion = editableCharacter.legion ?? safeCharacter.legion ?? '';
	const linkSkill = editableCharacter.linkSkill ?? safeCharacter.linkSkill ?? '';
	const ArcaneSymbol = editableCharacter.ArcaneSymbol ?? safeCharacter.ArcaneSymbol;
	const SacredSymbol = editableCharacter.SacredSymbol ?? safeCharacter.SacredSymbol;
	const GrandSacredSymbol = editableCharacter.GrandSacredSymbol ?? safeCharacter.GrandSacredSymbol;

	const BOSS_ICON_SIZE = 90;
	const ICON_SIZE = 64;
	const CHARACTER_IMG_SIZE = 80;

	// Submit user changes
	const onSubmit = async () => {
		try {
			setSubmitLoading(true);
			// Sanitize input to avoid XSS
			const sanitizedUser = sanitizeInputFrontend(userOrigin);
			const sanitizedServer = sanitizeInputFrontend(server);
			const sanitizedCode = sanitizeInputFrontend(code);

			// Prepare payload for API
			const payload = {
				userOrigin: sanitizedUser,
				server: sanitizedServer,
				code: sanitizedCode,
				characterData: editableCharacter,
			};

			const response = await fetchWithTimeout('/api/characters/updateCharacter', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const result = (await response.json()) as ApiResponse;

			if (response.ok && result.success) {
				router.push('/login?reset=1');
			} else if (!result.success) {
				toast.error(result.error || 'Failed to update the character');
			} else {
				// Fallback safety net (shouldn't normally hit this)
				toast.error('Failed to update the character');
			}
		} catch (error: unknown) {
			if ((error as DOMException).name === 'AbortError') {
				toast.error('Request timed out. Please try again.');
			} else {
				toast.error('Unexpected error occurred');
				console.error('Update Character error:', error);
			}
		} finally {
			// Always reset loading state
			setSubmitLoading(false);
		}
	};

	return (
		<section className="mainContent">
			<div className={styles.mainDiv}>
				<Image
					src={`/assets/profile/${safeCharacter.code}.webp`}
					width={650}
					height={827}
					priority
					alt={`${safeCharacter.class} class profile Icon`}
				/>
				<div className={styles.characterContent}>
					<div className={styles.buttonLine}>
						<Button className={styles.discardButton} onClick={() => router.push(pathname.replace(/\/edit$/, ''))}>
							Discard Changes
						</Button>
						<Tooltip content="Please input a valid character name." placement="bottom" enabled={!!nameError}>
							<Button
								className={styles.saveChangesButton}
								disabled={!!nameError}
								isLoading={submitLoading}
								loaderSize={16}
								loaderColor="#121212"
								loaderBorderWidth={3}
								onClick={onSubmit}>
								Save Changes
							</Button>
						</Tooltip>
					</div>
					<div className={styles.usernameLine}>
						<div className={styles.characterImgSwitch}>
							<div className={styles.characterImgDiv}>
								<div className={styles.characterImgDiv}>
									{(editableCharacter.syncing ?? safeCharacter.syncing) &&
										(extraData?.characterImgURL ? (
											<Image
												src={extraData.characterImgURL}
												alt="Fetched from API"
												width={CHARACTER_IMG_SIZE}
												height={CHARACTER_IMG_SIZE}
											/>
										) : extraDataFailed ? (
											<Tooltip content={'Character not found.'} placement="top">
												<ErrorIcon
													width={CHARACTER_IMG_SIZE}
													height={CHARACTER_IMG_SIZE}
													className={styles.errorIcon}
												/>
											</Tooltip>
										) : (
											<SkeletonWrapper
												width={CHARACTER_IMG_SIZE}
												height={CHARACTER_IMG_SIZE}
												color="light"
												variant="rectangular"
											/>
										))}
								</div>
							</div>
							<Switch
								title={'Sync Character'}
								checked={editableCharacter.syncing ?? safeCharacter.syncing}
								tooltipMessage={'Automatically update level from MapleStory API.'}
								onCheckedChange={() =>
									setEditableCharacter((prev) => ({
										...prev,
										syncing: !(prev.syncing ?? safeCharacter.syncing),
									}))
								}
							/>
						</div>
						<Tooltip content={nameError} placement="left" enabled={!!nameError}>
							<input
								className={clsx(styles.characterName, { [styles.invalid]: !!nameError })}
								type="text"
								value={editableCharacter.name ?? ''}
								placeholder={safeCharacter.name}
								onChange={(e) => {
									const value = e.target.value;
									setEditableCharacter((prev) => ({ ...prev, name: value }));
								}}
								onBlur={(e) => {
									const value = e.target.value;
									const error = checkCharacterName(value);
									setNameError(error);

									if (!error) {
										setCommittedName(value);
									}
								}}
							/>
						</Tooltip>
					</div>
					<div className={styles.bigBlock}>
						<div className={styles.characterBossLinkLegion}>
							<div className={styles.bossSlot}>
								<Tooltip content={'Click to toggle Boss Slayer status'} placement="bottom">
									<div
										onClick={() =>
											setEditableCharacter((prev) => ({
												...prev,
												bossing: !(prev.bossing ?? safeCharacter.bossing),
											}))
										}
										style={{ cursor: 'pointer' }}>
										<BossIcon
											width={BOSS_ICON_SIZE}
											height={BOSS_ICON_SIZE}
											className={clsx(styles.bossIcon, {
												[styles.on]: editableCharacter.bossing ?? safeCharacter.bossing,
												[styles.off]: !(editableCharacter.bossing ?? safeCharacter.bossing),
											})}
										/>
									</div>
								</Tooltip>
							</div>
							<LinkSkillBlock characterLevel={level} characterLinkSkill={linkSkill} iconSize={ICON_SIZE} showTooltip />
							<LegionBlock
								characterLevel={level}
								characterCode={codeChar}
								characterJobType={jobType}
								characterLegionType={legion}
								iconSize={ICON_SIZE}
								showTooltip
							/>
						</div>
						<div className={styles.characterClassJob}>
							<p className={styles.characterClass}>{charClass}</p>
							<p className={styles.characterJob}>{job}</p>
						</div>
					</div>
					<div className={styles.levelDiv}>
						<div className={styles.levelArea}>
							<p className={styles.levelText}>Level:</p>
							<input
								className={styles.levelInput}
								type="number"
								min={0}
								value={levelInput}
								placeholder={character?.level?.toString()}
								onChange={(e) => setLevelInput(e.target.value)}
								onBlur={() =>
									setEditableCharacter((prev) => ({
										...prev,
										level: levelInput === '' ? undefined : Number(levelInput),
									}))
								}
							/>
							<span className={styles.levelSpan}>/</span>
							<input
								className={styles.levelInput}
								type="number"
								min={0}
								value={targetLevelInput}
								placeholder={character?.targetLevel?.toString()}
								onChange={(e) => setTargetLevelInput(e.target.value)}
								onBlur={() =>
									setEditableCharacter((prev) => ({
										...prev,
										targetLevel: targetLevelInput === '' ? undefined : Number(targetLevelInput),
									}))
								}
							/>
						</div>
						<ProgressBar height={32} width={900} value={level} maxValue={targetLevel} jobType={jobType} />
					</div>
					<div className={styles.symbols}>
						<p className={styles.title}>Arcane Symbols</p>
						<EditPageSymbolGrid
							type="arcane"
							symbols={ArcaneSymbol}
							characterLevel={level}
							characterJobType={jobType}
							size={56}
							onChange={(updatedSymbols) =>
								setEditableCharacter((prev) => ({
									...prev,
									ArcaneSymbol: updatedSymbols,
								}))
							}
						/>

						<p className={styles.title}>Sacred Symbols</p>
						<EditPageSymbolGrid
							type="sacred"
							symbols={SacredSymbol}
							characterLevel={level}
							characterJobType={jobType}
							size={56}
							onChange={(updatedSymbols) =>
								setEditableCharacter((prev) => ({
									...prev,
									SacredSymbol: updatedSymbols,
								}))
							}
						/>

						<p className={styles.title}>Grand Sacred Symbols</p>
						<EditPageSymbolGrid
							type="grand"
							symbols={GrandSacredSymbol}
							characterLevel={level}
							characterJobType={jobType}
							size={56}
							onChange={(updatedSymbols) =>
								setEditableCharacter((prev) => ({
									...prev,
									GrandSacredSymbol: updatedSymbols,
								}))
							}
						/>
					</div>
				</div>
			</div>
		</section>
	);
}

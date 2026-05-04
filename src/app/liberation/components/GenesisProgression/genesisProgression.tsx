'use client';

import { clsx } from 'clsx';
import { startOfDay } from 'date-fns';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import CheckedIcon from '@assets/svg/check-boss.svg';
import CircleIcon from '@assets/svg/circle-boss.svg';
import LockIcon from '@assets/svg/lock.svg';
import Tooltip from '@components/Tooltip/tooltip';
import { GENESIS_MIN_LEVEL } from '@data/liberation/constant';
import { createNormalizedEmptyBossList, getBossesByType } from '@data/liberation/liberationBosses';
import { getQuestsByType, getLiberationTotal } from '@data/liberation/liberationQuests';
import { liberationApi } from '@features/liberation/liberationApi';
import { isSameDay } from '@utils/time';

import { calculateQuestPoints, calculateCumulativePoints } from '../../lib/calculatePoints';
import BossesSelectionComponent from '../BossesSelectionComponent/bossesSelectionComponent';
import PointsInput from '../pointsInput/pointsInput';
import ProgressionBarDiv from '../ProgressionBarDiv/progressionBarDiv';
import ProgressPrevision from '../ProgressPrevision/progressPrevision';
import QuestDropdown from '../QuestDropdown/questDropdown';
import WeeklyBreakdown from '../WeeklyBreakdown/weeklyBreakdown';

import styles from './genesisProgression.module.scss';
import GenesisSchedule from './genesisSchedule/genesisSchedule';

import type { WeeklyMonthlyPoints } from '@data/liberation/liberationBosses';
import type {
	checkedBossResponseBody,
	GetLiberationListCharacterResponseBody,
} from '@features/liberation/schemas/liberation.response.schema';
import type { JSX } from 'react';

type Props = {
	selectedCharacter: GetLiberationListCharacterResponseBody | null;
	currentDate: Date;
	server: string;
	onCharacterUpdate?: (updatedCharacter: Partial<GetLiberationListCharacterResponseBody>) => void;
};

type CachedEntry = {
	characterId: string;
	data: checkedBossResponseBody[];
};

type ProgressSnapshot = {
	selectedQuest: string;
	tracesPoints: number;
};

const firstQuest = 'Von Leon';
const lastQuest = 'Verus Hilla';
const QUEST_TYPE = 'Genesis';

const bosses = getBossesByType(QUEST_TYPE);
const totalPoints = getLiberationTotal(QUEST_TYPE);

const GenesisProgression = ({ selectedCharacter, currentDate, server, onCharacterUpdate }: Props): JSX.Element => {
	const genesisQuests = getQuestsByType(QUEST_TYPE);
	if (!genesisQuests || !selectedCharacter) {
		redirect('/error');
	}

	const currentDay = currentDate;

	const [selectedQuest, setSelectedQuest] = useState<string | null>(selectedCharacter.currentGenesisQuest);
	const [tracesPoints, setTracesPoints] = useState<number>(selectedCharacter.currentGenesisPoints);

	const [genesisPass, setGenesisPass] = useState<boolean>(Boolean(selectedCharacter.genesisPass));

	const [liberated, setLiberated] = useState<boolean>(Boolean(selectedCharacter.liberated));

	const [selectedDate, setSelectedDate] = useState<Date>(currentDay);
	const [checkedBosses, setCheckedBosses] = useState<checkedBossResponseBody[]>([]);

	const [weeklyMonthlyPoints, setWeeklyMonthlyPoints] = useState<WeeklyMonthlyPoints>({
		thisWeekPoints: 0,
		totalWeeklyPoints: 0,
		thisMonthPoints: 0,
		totalMonthlyPoints: 0,
		bosses: {},
	});

	const previousProgressRef = useRef<ProgressSnapshot | null>(null);
	const currentDayCacheRef = useRef<CachedEntry | null>(null);
	const activeRequestRef = useRef<string | null>(null);

	// Track if the current update is from backend sync to prevent loops
	const isBackendSyncRef = useRef<boolean>(false);
	// Track previous values to avoid unnecessary local updates
	const prevCharacterIdRef = useRef<string>(selectedCharacter.characterId);
	const prevGenesisQuestRef = useRef<string | null>(selectedCharacter.currentGenesisQuest);
	const prevGenesisPointsRef = useRef<number>(selectedCharacter.currentGenesisPoints);
	const prevGenesisPassRef = useRef<boolean>(Boolean(selectedCharacter.genesisPass));

	const disableProgress = (selectedCharacter?.level ?? 0) < GENESIS_MIN_LEVEL;

	const questPoints = Number(calculateQuestPoints(selectedQuest, QUEST_TYPE) ?? 0);
	const cumulativeTracesPoints = Number(calculateCumulativePoints(selectedQuest, QUEST_TYPE, tracesPoints) ?? 0);

	const remainingTotalTraces = totalPoints - cumulativeTracesPoints;
	const remainingCurrentTraces = questPoints - tracesPoints;

	useEffect(() => {
		setSelectedDate((prev) => (prev && isSameDay(prev, currentDay) ? prev : currentDay));
	}, [currentDay]);

	useEffect((): void => {
		// Skip if this is the initial load or if nothing changed
		const characterChanged = prevCharacterIdRef.current !== selectedCharacter.characterId;
		const questChanged = prevGenesisQuestRef.current !== selectedCharacter.currentGenesisQuest;
		const pointsChanged = prevGenesisPointsRef.current !== selectedCharacter.currentGenesisPoints;
		const passChanged = prevGenesisPassRef.current !== Boolean(selectedCharacter.genesisPass);
		if (!characterChanged && !questChanged && !pointsChanged && !passChanged) {
			return;
		}

		isBackendSyncRef.current = true;

		if (questChanged) {
			setSelectedQuest(selectedCharacter.currentGenesisQuest);
		}
		if (pointsChanged) {
			setTracesPoints(selectedCharacter.currentGenesisPoints);
		}
		if (passChanged) {
			setGenesisPass(Boolean(selectedCharacter.genesisPass));
		}

		prevCharacterIdRef.current = selectedCharacter.characterId;
		prevGenesisQuestRef.current = selectedCharacter.currentGenesisQuest;
		prevGenesisPointsRef.current = selectedCharacter.currentGenesisPoints;
		prevGenesisPassRef.current = Boolean(selectedCharacter.genesisPass);

		setTimeout(() => {
			isBackendSyncRef.current = false;
		}, 100);
	}, [
		selectedCharacter.characterId,
		selectedCharacter.currentGenesisQuest,
		selectedCharacter.currentGenesisPoints,
		selectedCharacter.genesisPass,
	]);

	useEffect((): void => {
		if (!isSameDay(selectedDate, currentDay)) {
			setCheckedBosses(createNormalizedEmptyBossList(QUEST_TYPE) ?? []);

			return;
		}

		const characterId = selectedCharacter.characterId;
		const cache = currentDayCacheRef.current;
		if (cache?.characterId === characterId) {
			setCheckedBosses(cache.data);

			return;
		}

		const requestKey = `${selectedCharacter.characterId}-${currentDay.valueOf()}`;
		activeRequestRef.current = requestKey;

		const run = async (): Promise<void> => {
			try {
				const response = await liberationApi.getCheckedBossesList({
					server,
					type: QUEST_TYPE,
					characterId: selectedCharacter.characterId,
					requestDate: currentDay,
				});

				if (activeRequestRef.current !== requestKey) {
					return;
				}

				const data = response.data ?? [];

				currentDayCacheRef.current = { characterId: selectedCharacter.characterId, data };
				setCheckedBosses(data);
			} catch (error) {
				console.error(error);
			}
		};

		void run();
	}, [currentDate, selectedDate, selectedCharacter.characterId, server]);

	const handleLiberatedToggle = (): void => {
		setLiberated((prev) => {
			const next = !prev;

			if (next) {
				previousProgressRef.current = { selectedQuest: selectedQuest ?? firstQuest, tracesPoints };

				setSelectedQuest(lastQuest);
				setTracesPoints(1000);
			} else {
				const previous = previousProgressRef.current;

				setSelectedQuest(previous?.selectedQuest ?? firstQuest);
				setTracesPoints(previous?.tracesPoints ?? 0);
			}

			return next;
		});
	};

	// Handle user updates - only trigger sync for user-initiated changes
	useEffect(() => {
		if (isBackendSyncRef.current || !selectedCharacter) {
			return;
		}

		const questChanged = selectedQuest !== selectedCharacter.currentGenesisQuest;
		const pointsChanged = tracesPoints !== selectedCharacter.currentGenesisPoints;
		const passChanged = genesisPass !== Boolean(selectedCharacter.genesisPass);
		const liberatedChanged = liberated !== selectedCharacter.liberated;
		if (!questChanged && !pointsChanged && !passChanged && !liberatedChanged) {
			return;
		}

		if (onCharacterUpdate) {
			onCharacterUpdate({
				currentGenesisQuest: selectedQuest ?? undefined,
				currentGenesisPoints: tracesPoints,
				genesisPass,
				liberated,
			});
		}
	}, [selectedQuest, tracesPoints, genesisPass, liberated, selectedCharacter, onCharacterUpdate]);

	const IconComponent = liberated ? CheckedIcon : CircleIcon;

	return (
		<div>
			<div className={styles.currentProgressWrapper}>
				{disableProgress && (
					<div className={styles.disabledOverlay}>
						<div className={styles.overlayContent}>
							<LockIcon height={56} width={56} />
							<p className={styles.title}>Level Requirement Not Met</p>
							<p className={styles.description}>
								Genesis Liberation tracker is available only for characters level 255 or higher.
							</p>
							<p className={styles.description}>Please update character data to unlock.</p>
						</div>
					</div>
				)}

				<div className={clsx(styles.currentProgress, { [styles.disabled]: disableProgress })}>
					<p className={styles.title}>Current Progress</p>

					<div className={styles.progressInput}>
						<div>
							<p className={styles.inputTitle}>Current Mission</p>
							<QuestDropdown
								onSelectBoss={setSelectedQuest}
								quest={genesisQuests}
								selectedQuest={selectedQuest}
								type={QUEST_TYPE}
							/>
						</div>

						<div>
							<p className={styles.inputTitle}>Current Traces</p>
							<PointsInput onChangePoints={setTracesPoints} points={tracesPoints} />
						</div>

						<div className={styles.toggleDiv}>
							<p className={styles.inputTitle}>Genesis Pass</p>
							<Image
								className={clsx(styles.genesisPass, { [styles.off]: !genesisPass })}
								alt="Genesis Pass"
								height={64}
								onClick={(): void => setGenesisPass((prev) => !prev)}
								src="/assets/icons/menu/genesisPass.webp"
								width={88}
							/>
						</div>

						<div className={styles.toggleDiv}>
							<p className={styles.inputTitle}>Liberated</p>
							<Tooltip
								content="Required for Destiny Liberation. Updates automatically as you earn points or enter them manually."
								placement="top">
								<IconComponent
									className={styles.liberatedIcon}
									height={56}
									onClick={handleLiberatedToggle}
									width={56}
								/>
							</Tooltip>
						</div>
					</div>

					<ProgressionBarDiv
						cumulativeTracesPoints={cumulativeTracesPoints}
						currentPoints={tracesPoints}
						questPoints={questPoints}
						totalPoints={totalPoints}
					/>
				</div>
			</div>
			<div className={styles.grid}>
				<div className={styles.column}>
					<ProgressPrevision
						onChangeDate={(value: string): void => {
							if (value) {
								const [y, m, d] = value.split('-').map(Number);
								const localDate = new Date(y, m - 1, d);

								setSelectedDate(startOfDay(localDate));
							}
						}}
						selectedDate={selectedDate}
					/>
					<BossesSelectionComponent
						bosses={bosses}
						checkedBosses={checkedBosses}
						onChangeWeeklyTotals={setWeeklyMonthlyPoints}
						type={QUEST_TYPE}
					/>
				</div>

				<div className={styles.column}>
					<GenesisSchedule
						disableProgress={disableProgress}
						genesisPass={genesisPass}
						handleToggleGenesisPass={(): void => setGenesisPass((prev) => !prev)}
						remainingCurrentTraces={remainingCurrentTraces}
						remainingTotalTraces={remainingTotalTraces}
						selectedDate={selectedDate}
						weeklyMonthlyPoints={weeklyMonthlyPoints}
					/>
					<WeeklyBreakdown bosses={bosses} type={QUEST_TYPE} weeklyMonthlyPoints={weeklyMonthlyPoints} />
				</div>
			</div>
		</div>
	);
};

export default GenesisProgression;

'use client';

import { clsx } from 'clsx';
import { redirect } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import LockIcon from '@assets/svg/lock.svg';
import { DESTINY_MIN_LEVEL } from '@data/liberation/constant';
import { createNormalizedEmptyBossList, getBossesByType } from '@data/liberation/liberationBosses';
import { getQuestsByType, getLiberationTotal } from '@data/liberation/liberationQuests';
import { liberationApi } from '@features/liberation/liberationApi';
import dayjs from '@utils/dayjs';

import { calculateQuestPoints, calculateCumulativePoints } from '../../lib/calculatePoints';
import BossesSelectionComponent from '../BossesSelectionComponent/bossesSelectionComponent';
import PointsInput from '../pointsInput/pointsInput';
import ProgressionBarDiv from '../ProgressionBarDiv/progressionBarDiv';
import ProgressPrevision from '../ProgressPrevision/progressPrevision';
import QuestDropdown from '../QuestDropdown/questDropdown';
import WeeklyBreakdown from '../WeeklyBreakdown/weeklyBreakdown';

import styles from './destinyProgression.module.scss';
import DestinySchedule from './destinySchedule/destinySchedule';

import type { WeeklyMonthlyPoints } from '@data/liberation/liberationBosses';
import type {
	checkedBossResponseBody,
	GetLiberationListCharacterResponseBody,
} from '@features/liberation/schemas/liberation.response.schema';
import type { Dayjs } from 'dayjs';
import type { JSX } from 'react';

type Props = {
	selectedCharacter: GetLiberationListCharacterResponseBody | null;
	currentDate: Date | string;
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

const QUEST_TYPE = 'Destiny';

const bosses = getBossesByType(QUEST_TYPE);
const totalPoints = getLiberationTotal(QUEST_TYPE);

const DestinyProgression = ({ selectedCharacter, currentDate, server, onCharacterUpdate }: Props): JSX.Element => {
	const destinyQuests = getQuestsByType(QUEST_TYPE);
	if (!destinyQuests || !selectedCharacter) {
		redirect('/error');
	}

	const currentDay = dayjs(currentDate).utc();

	const [selectedQuest, setSelectedQuest] = useState<string | null>(selectedCharacter.currentDestinyQuest);
	const [determinationPoints, setDeterminationPoints] = useState<number>(selectedCharacter.currentDestinyPoints);

	const [selectedDate, setSelectedDate] = useState<Dayjs>(currentDay);
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

	const isBackendSyncRef = useRef<boolean>(false);
	const prevCharacterIdRef = useRef<string>(selectedCharacter.characterId);
	const prevDestinyQuestRef = useRef<string | null>(selectedCharacter.currentDestinyQuest);
	const prevDestinyPointsRef = useRef<number>(selectedCharacter.currentDestinyPoints);

	const liberated = selectedCharacter?.liberated;
	const disableProgress = (selectedCharacter?.level ?? 0) <= DESTINY_MIN_LEVEL && !liberated;

	const questPoints = Number(calculateQuestPoints(selectedQuest, QUEST_TYPE) ?? 0);
	const cumulativeTracesPoints = Number(calculateCumulativePoints(selectedQuest, QUEST_TYPE, determinationPoints) ?? 0);

	const remainingTotalDetermination = totalPoints - cumulativeTracesPoints;
	const remainingCurrentDetermination = questPoints - determinationPoints;

	useEffect((): void => {
		setSelectedDate((prev) => (prev.isSame(currentDay, 'day') ? prev : currentDay));
	}, [currentDate]);

	// Handle backend sync updates without triggering new syncs
	useEffect((): void => {
		const characterChanged = prevCharacterIdRef.current !== selectedCharacter.characterId;
		const questChanged = prevDestinyQuestRef.current !== selectedCharacter.currentDestinyQuest;
		const pointsChanged = prevDestinyPointsRef.current !== selectedCharacter.currentDestinyPoints;
		if (!characterChanged && !questChanged && !pointsChanged) {
			return;
		}

		isBackendSyncRef.current = true;

		if (questChanged) {
			setSelectedQuest(selectedCharacter.currentDestinyQuest);
		}
		if (pointsChanged) {
			setDeterminationPoints(selectedCharacter.currentDestinyPoints);
		}

		prevCharacterIdRef.current = selectedCharacter.characterId;
		prevDestinyQuestRef.current = selectedCharacter.currentDestinyQuest;
		prevDestinyPointsRef.current = selectedCharacter.currentDestinyPoints;

		setTimeout(() => {
			isBackendSyncRef.current = false;
		}, 100);
	}, [selectedCharacter.characterId, selectedCharacter.currentDestinyQuest, selectedCharacter.currentDestinyPoints]);

	useEffect((): void => {
		previousProgressRef.current = null;
		currentDayCacheRef.current = null;
		activeRequestRef.current = null;
	}, [selectedCharacter.characterId]);

	useEffect((): void => {
		setSelectedQuest(selectedCharacter.currentDestinyQuest);
		setDeterminationPoints(selectedCharacter.currentDestinyPoints);
	}, [selectedCharacter.currentDestinyQuest, selectedCharacter.currentDestinyPoints]);

	useEffect((): void => {
		if (!selectedDate.isSame(currentDay, 'day')) {
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
					requestDate: currentDay.toDate(),
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

	// Handle user updates - only trigger sync for user-initiated changes
	useEffect(() => {
		if (isBackendSyncRef.current || !selectedCharacter) {
			return;
		}

		const questChanged = selectedQuest !== selectedCharacter.currentDestinyQuest;
		const pointsChanged = determinationPoints !== selectedCharacter.currentDestinyPoints;
		if (!questChanged && !pointsChanged) {
			return;
		}

		if (onCharacterUpdate) {
			onCharacterUpdate({
				currentDestinyQuest: selectedQuest ?? undefined,
				currentDestinyPoints: determinationPoints,
				liberated,
			});
		}
	}, [selectedQuest, determinationPoints, liberated, selectedCharacter, onCharacterUpdate]);

	return (
		<div>
			<div className={styles.currentProgressWrapper}>
				{disableProgress && (
					<div className={styles.disabledOverlay}>
						<div className={styles.overlayContent}>
							<LockIcon height={56} width={56} />
							<p className={styles.title}>Level Requirement Not Met</p>
							<p className={styles.description}>
								Destiny Liberation tracker is available only for characters level 275 who finished Genesis Liberation.
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
								quest={destinyQuests}
								selectedQuest={selectedQuest}
								type={QUEST_TYPE}
							/>
						</div>

						<div>
							<p className={styles.inputTitle}>Current Determination</p>
							<PointsInput onChangePoints={setDeterminationPoints} points={determinationPoints} />
						</div>
					</div>

					<ProgressionBarDiv
						cumulativeTracesPoints={cumulativeTracesPoints}
						currentPoints={determinationPoints}
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
								setSelectedDate(dayjs.utc(value));
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
					<DestinySchedule
						determinationPoints={determinationPoints}
						disableProgress={disableProgress}
						remainingCurrentDetermination={remainingCurrentDetermination}
						remainingTotalDetermination={remainingTotalDetermination}
						selectedDate={selectedDate}
						selectedQuest={selectedQuest}
						weeklyMonthlyPoints={weeklyMonthlyPoints}
					/>
					<WeeklyBreakdown bosses={bosses} type={QUEST_TYPE} weeklyMonthlyPoints={weeklyMonthlyPoints} />
				</div>
			</div>
		</div>
	);
};

export default DestinyProgression;

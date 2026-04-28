'use client';

import { clsx } from 'clsx';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import CheckedIcon from '@assets/svg/check-boss.svg';
import CircleIcon from '@assets/svg/circle-boss.svg';
import ProgressBar from '@components/ProgressBar/progressBar';
import Tooltip from '@components/Tooltip/tooltip';
import { createNormalizedEmptyBossList, getBossesByType } from '@data/liberation/liberationBosses';
import { getQuestsByType, getLiberationTotal } from '@data/liberation/liberationQuests';
import { liberationApi } from '@features/liberation/liberationApi';
import dayjs from '@utils/dayjs';

import { calculateQuestPoints, calculateCumulativePoints } from '../../lib/calculatePoints';
import { useGenesisSyncPayload } from '../../lib/useSyncPayload';
import BossesSelectionComponent from '../BossesSelectionComponent/bossesSelectionComponent';
import PointsInput from '../pointsInput/pointsInput';
import ProgressPrevision from '../ProgressPrevision/progressPrevision';
import QuestDropdown from '../QuestDropdown/questDropdown';

import styles from './genesisProgression.module.scss';
import GenesisSchedule from './genesisSchedule/genesisSchedule';
import GenesisTracesBreakdown from './genesisTracesBreakdown/genesisTracesBreakdown';

import type { WeeklyMonthlyPoints } from '@data/liberation/liberationBosses';
import type {
	checkedBossResponseBody,
	GetLiberationListCharacterResponseBody,
} from '@features/liberation/schemas/liberation.response.schema';
import type { Dayjs } from 'dayjs';
import type { JSX } from 'react';

type Params = {
	selectedCharacter: GetLiberationListCharacterResponseBody | null;
	currentDate: Date | string;
	server: string;
};

type CachedEntry = {
	characterId: string;
	data: checkedBossResponseBody[];
};

type ProgressSnapshot = {
	selectedQuest: string;
	tracesPoints: number;
};

const GenesisProgression = ({ selectedCharacter, currentDate, server }: Params): JSX.Element => {
	const genesisQuests = getQuestsByType('Genesis');
	if (!genesisQuests || !selectedCharacter) {
		redirect('/error');
	}

	const currentDay = dayjs(currentDate).utc();

	const bosses = getBossesByType('Genesis');
	const totalPoints = getLiberationTotal('Genesis');

	const firstQuest = 'Von Leon';
	const lastQuest = 'Verus Hilla';

	const [selectedQuest, setSelectedQuest] = useState<string | null>(selectedCharacter.currentQuest);
	const [tracesPoints, setTracesPoints] = useState<number>(selectedCharacter.currentPoints);

	const [genesisPass, setGenesisPass] = useState<boolean>(Boolean(selectedCharacter.genesisPass));

	const [liberated, setLiberated] = useState<boolean>(false);

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

	const disableProgress = (selectedCharacter?.level ?? 0) < 255;

	const questPoints = Number(calculateQuestPoints(selectedQuest, 'Genesis') ?? 0);
	const cumulativeTracesPoints = Number(calculateCumulativePoints(selectedQuest, 'Genesis', tracesPoints) ?? 0);

	const remainingTotalTraces = totalPoints - cumulativeTracesPoints;
	const remainingCurrentTraces = questPoints - tracesPoints;

	useGenesisSyncPayload({
		characterId: selectedCharacter.characterId,
		type: 'Genesis',
		currentQuest: selectedQuest ?? firstQuest ?? '',
		currentPoints: tracesPoints,
		genesisPass,
		liberated,
	});

	useEffect((): void => {
		setSelectedDate((prev) => (prev.isSame(currentDay, 'day') ? prev : currentDay));
	}, [currentDate]);

	useEffect((): void => {
		setSelectedQuest(selectedCharacter.currentQuest);
		setGenesisPass(Boolean(selectedCharacter.genesisPass));
		setTracesPoints(selectedCharacter.currentPoints);
	}, [selectedCharacter.currentQuest, selectedCharacter.genesisPass, selectedCharacter.currentPoints]);

	useEffect((): void => {
		setLiberated(cumulativeTracesPoints >= totalPoints);
	}, [cumulativeTracesPoints, totalPoints]);

	useEffect((): void => {
		previousProgressRef.current = null;
	}, [selectedCharacter.characterId]);

	useEffect((): void => {
		if (!selectedDate.isSame(currentDay, 'day')) {
			setCheckedBosses(createNormalizedEmptyBossList('Genesis') ?? []);
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
					type: 'Genesis',
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

	const handleLiberatedToggle = (): void => {
		setLiberated((prev) => {
			const next = !prev;

			if (next) {
				previousProgressRef.current = {
					selectedQuest: selectedQuest ?? firstQuest,
					tracesPoints,
				};

				setSelectedQuest(lastQuest);
				setTracesPoints(totalPoints);
			} else {
				const previous = previousProgressRef.current;

				setSelectedQuest(previous?.selectedQuest ?? firstQuest);
				setTracesPoints(previous?.tracesPoints ?? 0);
			}

			return next;
		});
	};

	const IconComponent = liberated ? CheckedIcon : CircleIcon;

	return (
		<div>
			<div className={styles.currentProgressWrapper}>
				{disableProgress && (
					<div className={styles.disabledOverlay}>
						<div className={styles.overlayContent}>
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
							<QuestDropdown onSelectBoss={setSelectedQuest} quest={genesisQuests} selectedQuest={selectedQuest} />
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

					<div className={styles.progressBar}>
						<div>
							<div className={styles.progressBarText}>
								<p>Current Quest Progress</p>
								<p>
									{tracesPoints}/{questPoints}
								</p>
							</div>
							<ProgressBar height={32} jobType="default" maxValue={questPoints} value={tracesPoints} width={1488} />
						</div>

						<div>
							<div className={styles.progressBarText}>
								<p>Overall Progress</p>
								<p>
									{cumulativeTracesPoints}/{totalPoints}
								</p>
							</div>
							<ProgressBar
								height={32}
								jobType="default"
								maxValue={totalPoints}
								value={cumulativeTracesPoints}
								width={1488}
							/>
						</div>
					</div>
				</div>
			</div>
			<div className={styles.grid}>
				<div className={styles.column}>
					<ProgressPrevision
						onChangeDate={(value: string): void => {
							if (value) setSelectedDate(dayjs.utc(value));
						}}
						selectedDate={selectedDate}
					/>
					<BossesSelectionComponent
						bosses={bosses}
						checkedBosses={checkedBosses}
						onChangeWeeklyTotals={setWeeklyMonthlyPoints}
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
					<GenesisTracesBreakdown bosses={bosses} weeklyMonthlyPoints={weeklyMonthlyPoints} />
				</div>
			</div>
		</div>
	);
};

export default GenesisProgression;

import liberationQuestsJson from './liberationQuests.json';

type LiberationEntry = { img: string; points: number };

type AstraEntry = { img: string; vestiges: number; traces: number };

type RawLiberationQuest = { total: number; [key: string]: number | LiberationEntry };

type RawAstraQuest = { totalVestiges: number; totalTraces: number; [key: string]: number | AstraEntry };

export type LiberationQuest = { total: number; bosses: Record<string, LiberationEntry> };

export type AstraQuest = { totalVestiges: number; totalTraces: number; bosses: Record<string, AstraEntry> };

type LiberationMilestones = Record<string, LiberationQuest>;

const extractBosses = <T>(data: Record<string, unknown>, excludedKeys: readonly string[]): Record<string, T> =>
	Object.fromEntries(Object.entries(data).filter(([key]) => !excludedKeys.includes(key))) as Record<string, T>;

const normalizeLiberationData = (raw: Record<string, RawLiberationQuest>): LiberationMilestones => {
	return Object.fromEntries(
		Object.entries(raw)
			.filter(([questName]) => questName !== 'Astra')
			.map(([questName, questData]) => [
				questName,
				{ total: questData.total, bosses: extractBosses<LiberationEntry>(questData, ['total']) },
			]),
	);
};
const normalizeAstraData = (raw: RawAstraQuest): AstraQuest => {
	return {
		totalVestiges: raw.totalVestiges,
		totalTraces: raw.totalTraces,
		bosses: extractBosses<AstraEntry>(raw, ['totalVestiges', 'totalTraces']),
	};
};

const rawJson = liberationQuestsJson as unknown as Record<string, RawLiberationQuest> & { Astra: RawAstraQuest };

const liberationMilestones: LiberationMilestones = normalizeLiberationData(rawJson);
const astraMilestone: AstraQuest = normalizeAstraData(rawJson.Astra);

const createMap = <T>(data: Record<string, T>): Map<string, T> => new Map(Object.entries(data));

const liberationMap = new Map(
	Object.entries(liberationMilestones).map(([questName, questData]) => [questName, createMap(questData.bosses)]),
);

const astraMap = createMap(astraMilestone.bosses);

// For Zod Validation
const questTypesArray = Object.keys(liberationQuestsJson) as Array<keyof typeof liberationQuestsJson>;

export const questTypes = questTypesArray as unknown as readonly [
	keyof typeof liberationQuestsJson,
	...(keyof typeof liberationQuestsJson)[],
];

const extractBossNamesByQuest = (): {
	genesisBossNames: string[];
	destinyBossNames: string[];
	astraQuestNames: string[];
} => {
	const genesisBosses: string[] = [];
	const destinyBosses: string[] = [];
	const astraQuests: string[] = [];

	const questCollections: Record<string, string[]> = {
		Genesis: genesisBosses,
		Destiny: destinyBosses,
		Astra: astraQuests,
	};

	const excludedKeys = new Set(['total', 'totalVestiges', 'totalTraces']);

	for (const [questType, quest] of Object.entries(liberationQuestsJson)) {
		const collection = questCollections[questType];
		if (!collection) {
			continue;
		}

		for (const key of Object.keys(quest)) {
			if (excludedKeys.has(key)) {
				continue;
			}

			collection.push(key);
		}
	}

	return { genesisBossNames: genesisBosses, destinyBossNames: destinyBosses, astraQuestNames: astraQuests };
};

const { genesisBossNames, destinyBossNames, astraQuestNames } = extractBossNamesByQuest();

export const genesisBosses = genesisBossNames as unknown as readonly [string, ...string[]];
export const destinyBosses = destinyBossNames as unknown as readonly [string, ...string[]];
export const astraQuests = astraQuestNames as unknown as readonly [string, ...string[]];

// Aux functions

export const getQuestsByType = (questType: string): LiberationQuest | null => liberationMilestones[questType] ?? null;

export const getAstraQuest = (): AstraQuest => astraMilestone;

export const getLiberationPoints = (questType: string, bossName: string): number =>
	liberationMap.get(questType)?.get(bossName)?.points ?? 0;

export const getAstraPoints = (questName: string): { vestiges: number; traces: number } => {
	const rewards = astraMap.get(questName);

	return { vestiges: rewards?.vestiges ?? 0, traces: rewards?.traces ?? 0 };
};

type AstraCumulative = { vestiges: number; traces: number };

const accumulateUntil = <TEntry, TResult>(
	entries: readonly [string, TEntry][],
	targetName: string,
	includeTarget: boolean,
	createAccumulator: () => TResult,
	add: (accumulator: TResult, entry: TEntry) => void,
	remove: (accumulator: TResult, entry: TEntry) => void,
): TResult => {
	const accumulator = createAccumulator();

	for (const [currentName, entry] of entries) {
		add(accumulator, entry);

		if (currentName === targetName) {
			if (!includeTarget) {
				remove(accumulator, entry);
			}

			break;
		}
	}

	return accumulator;
};

export const getCumulativeLiberationPoints = (
	questType: string,
	bossName: string,
	includeTargetBoss = false,
): number => {
	const quest = liberationMilestones[questType];

	if (!quest) {
		return 0;
	}

	return accumulateUntil(
		Object.entries(quest.bosses),
		bossName,
		includeTargetBoss,
		() => ({ total: 0 }),
		(accumulator, entry) => {
			accumulator.total += entry.points;
		},
		(accumulator, entry) => {
			accumulator.total -= entry.points;
		},
	).total;
};

export const getCumulativeAstraPoints = (bossName: string, includeTargetBoss = false): AstraCumulative => {
	return accumulateUntil(
		Object.entries(astraMilestone.bosses),
		bossName,
		includeTargetBoss,
		(): AstraCumulative => ({ vestiges: 0, traces: 0 }),
		(accumulator, entry) => {
			accumulator.vestiges += entry.vestiges;
			accumulator.traces += entry.traces;
		},
		(accumulator, entry) => {
			accumulator.vestiges -= entry.vestiges;
			accumulator.traces -= entry.traces;
		},
	);
};

export const getLiberationTotal = (questName: string): number => liberationMilestones[questName]?.total ?? 0;

export const getAstraTotals = (): { totalVestiges: number; totalTraces: number } => {
	return { totalVestiges: astraMilestone.totalVestiges, totalTraces: astraMilestone.totalTraces };
};

type ResolveNextLiberationStateResult = { questName: string; points: number; liberated: boolean };

export const resolveNextLiberationState = (
	questType: string,
	questName: string,
	points: number,
): ResolveNextLiberationStateResult => {
	const normalizedQuestType = questType.charAt(0).toUpperCase() + questType.slice(1).toLowerCase();
	const isGenesis = normalizedQuestType === 'Genesis';
	const isDestiny = normalizedQuestType === 'Destiny';

	const quests = getQuestsByType(normalizedQuestType);

	const bossEntries = quests ? Object.entries(quests.bosses) : [];

	const currentIndex = bossEntries.findIndex(([bossName]) => bossName === questName);
	if (currentIndex === -1) {
		return { questName, points, liberated: isDestiny };
	}

	const hillaThreshold = isGenesis ? getLiberationPoints('Genesis', 'Verus Hilla') : 0;

	const getRequiredPoints = (index: number): number => {
		const entry = bossEntries[index];
		if (!entry) {
			return 0;
		}

		const [bossName, bossData] = entry;

		return isGenesis && bossName === 'Verus Hilla' ? hillaThreshold : bossData.points;
	};

	let currentBossIndex = currentIndex;
	let remainingPoints = points;

	// Move backward when removing points.
	while (remainingPoints < 0 && currentBossIndex > 0) {
		currentBossIndex -= 1;
		remainingPoints += getRequiredPoints(currentBossIndex);
	}

	if (remainingPoints < 0) {
		remainingPoints = 0;
		currentBossIndex = 0;
	}

	// Advance through completed quests.
	while (currentBossIndex < bossEntries.length - 1) {
		const requiredPoints = getRequiredPoints(currentBossIndex);

		if (remainingPoints < requiredPoints) {
			break;
		}

		remainingPoints -= requiredPoints;
		currentBossIndex += 1;
	}

	const currentEntry = bossEntries[currentBossIndex];
	if (!currentEntry) {
		return { questName, points, liberated: isDestiny };
	}

	const [nextQuestName] = currentEntry;
	const requiredPoints = getRequiredPoints(currentBossIndex);
	const normalizedPoints = Math.min(remainingPoints, requiredPoints);

	const isGenesisHilla = isGenesis && nextQuestName === 'Verus Hilla';

	return {
		questName: nextQuestName,
		points: normalizedPoints,
		liberated: isDestiny || (isGenesisHilla && normalizedPoints >= hillaThreshold),
	};
};

type ResolveNextAstraStateResult = { questName: string; vestiges: number; traces: number; liberated: boolean };

export const resolveNextAstraState = (
	questName: string,
	vestiges: number,
	traces: number,
): ResolveNextAstraStateResult => {
	const CURRENCY_LIMIT_CAP = 1000;
	const bossEntries = Object.entries(astraMilestone.bosses);

	const defaultResult: ResolveNextAstraStateResult = { questName, vestiges, traces, liberated: true };

	if (bossEntries.length === 0) {
		return defaultResult;
	}

	const currentIndex = bossEntries.findIndex(([bossName]) => bossName === questName);
	if (currentIndex === -1) {
		return defaultResult;
	}

	let currentBossIndex = currentIndex;
	let remainingVestiges = vestiges;
	let remainingTraces = traces;

	// Move backward when removing more currency than the current quest contains.
	while ((remainingVestiges < 0 || remainingTraces < 0) && currentBossIndex > 0) {
		currentBossIndex -= 1;

		const previousBoss = bossEntries[currentBossIndex];
		if (!previousBoss) {
			break;
		}

		const [, previousBossData] = previousBoss;

		remainingVestiges += previousBossData.vestiges;
		remainingTraces += previousBossData.traces;
	}

	// Prevent negative currency values when the removal exceeds all previous progress.
	if (remainingVestiges < 0 || remainingTraces < 0) {
		return { ...defaultResult, questName: bossEntries[0][0], vestiges: 0, traces: 0 };
	}

	// Move forward when enough currency is available to complete the current quest.
	for (let index = currentBossIndex; index < bossEntries.length; index += 1) {
		const entry = bossEntries[index];
		if (!entry) {
			break;
		}

		const [bossName, bossData] = entry;

		if (remainingVestiges < bossData.vestiges || remainingTraces < bossData.traces) {
			return { questName: bossName, vestiges: remainingVestiges, traces: remainingTraces, liberated: true };
		}

		const isLastBoss = index === bossEntries.length - 1;
		if (isLastBoss) {
			return { questName: bossName, vestiges: bossData.vestiges, traces: bossData.traces, liberated: true };
		}

		remainingVestiges = Math.min(remainingVestiges - bossData.vestiges, CURRENCY_LIMIT_CAP);
		remainingTraces = Math.min(remainingTraces - bossData.traces, CURRENCY_LIMIT_CAP);
	}

	const lastBoss = bossEntries[bossEntries.length - 1];
	if (!lastBoss) {
		return defaultResult;
	}

	const [lastBossName, lastBossData] = lastBoss;

	return { questName: lastBossName, vestiges: lastBossData.vestiges, traces: lastBossData.traces, liberated: true };
};

type imageSrc = Record<string, string>;

export const weaponQuestsImagesSrc: imageSrc = {
	genesis: '/assets/icons/liberation/currency/darkness.webp',
	astra_erion: '/assets/icons/liberation/currency/erion.webp',
	astra_battle: '/assets/icons/liberation/currency/battle.webp',
	destiny: '/assets/icons/liberation/currency/destiny.webp',
};

const getLastBossEntry = <T>(bosses: Record<string, T>): [string, T] | null => {
	const entries = Object.entries(bosses);

	return entries.length === 0 ? null : entries[entries.length - 1];
};

export const isFirstDestinyLiberation = (bossName: string): boolean => {
	const destinyQuest = getQuestsByType('Destiny');

	if (!destinyQuest) {
		return false;
	}

	const bossNames = Object.keys(destinyQuest.bosses);
	const bossIndex = bossNames.indexOf(bossName);

	return bossIndex !== -1 && bossIndex < bossNames.length / 2;
};

export const isLiberationQuestFinished = (
	questType: string,
	currentQuestName: string,
	currentPoints: number,
): boolean => {
	const quest = getQuestsByType(questType);

	if (!quest) {
		return false;
	}

	const lastBoss = getLastBossEntry(quest.bosses);

	if (!lastBoss) {
		return false;
	}

	const [lastBossName, lastBossData] = lastBoss;

	return currentQuestName === lastBossName && currentPoints >= lastBossData.points;
};

export const isAstraQuestFinished = (
	currentQuestName: string,
	currentVestiges: number,
	currentTraces: number,
): boolean => {
	const lastBoss = getLastBossEntry(astraMilestone.bosses);

	if (!lastBoss) {
		return false;
	}

	const [lastBossName, lastBossData] = lastBoss;

	return (
		currentQuestName === lastBossName &&
		currentVestiges >= lastBossData.vestiges &&
		currentTraces >= lastBossData.traces
	);
};

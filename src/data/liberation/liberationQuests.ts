import liberationQuestsJson from './liberationQuests.json';

type LiberationEntry = {
	img: string;
	points: number;
};

type AstraEntry = {
	img: string;
	vestiges: number;
	traces: number;
};

type RawLiberationQuest = {
	total: number;
	[key: string]: number | LiberationEntry;
};

type RawAstraQuest = {
	totalVestiges: number;
	totalTraces: number;
	[key: string]: number | AstraEntry;
};

export type LiberationQuest = {
	total: number;
	bosses: Record<string, LiberationEntry>;
};

export type AstraQuest = {
	totalVestiges: number;
	totalTraces: number;
	bosses: Record<string, AstraEntry>;
};

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

	for (const [questType, quest] of Object.entries(liberationQuestsJson)) {
		for (const key of Object.keys(quest)) {
			if (key === 'total' || key === 'totalVestiges' || key === 'totalTraces') {
				continue;
			}

			if (questType === 'Genesis') {
				genesisBosses.push(key);
			} else if (questType === 'Destiny') {
				destinyBosses.push(key);
			} else if (questType === 'Astra') {
				astraQuests.push(key);
			}
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

type AstraCumulative = {
	vestiges: number;
	traces: number;
};

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
		(): AstraCumulative => ({
			vestiges: 0,
			traces: 0,
		}),
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

type ResolveNextLiberationStateResult = {
	questName: string;
	points: number;
	liberated: boolean;
};

export const resolveNextLiberationState = (
	questType: string,
	questName: string,
	points: number,
): ResolveNextLiberationStateResult => {
	const quests = getQuestsByType(questType);

	const defaultResult: ResolveNextLiberationStateResult = { questName, points, liberated: questType === 'Destiny' };

	if (!quests) {
		return defaultResult;
	}

	const bossEntries = Object.entries(quests.bosses);

	if (bossEntries.length === 0) {
		return defaultResult;
	}

	const currentIndex = bossEntries.findIndex(([bossName]) => bossName === questName);

	if (currentIndex === -1) {
		return defaultResult;
	}

	const hillaThreshold = questType === 'Genesis' ? getLiberationPoints('Genesis', 'Verus Hilla') : 0;

	const resolveState = (bossName: string, rawPoints: number): ResolveNextLiberationStateResult => {
		const isGenesisHilla = questType === 'Genesis' && bossName === 'Verus Hilla';

		const normalizedPoints = isGenesisHilla ? Math.min(rawPoints, hillaThreshold) : rawPoints;

		const liberated = questType === 'Destiny' || (isGenesisHilla && normalizedPoints === hillaThreshold);

		return { questName: bossName, points: normalizedPoints, liberated };
	};

	let remainingPoints = points;

	for (let index = currentIndex; index < bossEntries.length; index += 1) {
		const [bossName, bossData] = bossEntries[index];

		if (remainingPoints < bossData.points) {
			return resolveState(bossName, remainingPoints);
		}

		const isLastBoss = index === bossEntries.length - 1;

		if (isLastBoss) {
			return resolveState(bossName, bossData.points);
		}

		remainingPoints -= bossData.points;
	}

	const [lastBossName, lastBossData] = bossEntries[bossEntries.length - 1];

	return resolveState(lastBossName, lastBossData.points);
};

type ResolveNextAstraStateResult = {
	questName: string;
	vestiges: number;
	traces: number;
	liberated: boolean;
};

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

	let remainingVestiges = vestiges;
	let remainingTraces = traces;

	for (let index = currentIndex; index < bossEntries.length; index += 1) {
		const [bossName, bossData] = bossEntries[index];

		if (remainingVestiges < bossData.vestiges || remainingTraces < bossData.traces) {
			return { questName: bossName, vestiges: remainingVestiges, traces: remainingTraces, liberated: true };
		}

		const isLastBoss = index === bossEntries.length - 1;

		if (isLastBoss) {
			return { questName: bossName, vestiges: bossData.vestiges, traces: bossData.traces, liberated: true };
		}

		remainingVestiges = Math.min(Math.max(remainingVestiges - bossData.vestiges, 0), CURRENCY_LIMIT_CAP);
		remainingTraces = Math.min(Math.max(remainingTraces - bossData.traces, 0), CURRENCY_LIMIT_CAP);
	}

	const [lastBossName, lastBossData] = bossEntries[bossEntries.length - 1];

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

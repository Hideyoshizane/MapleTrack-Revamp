import liberationQuestsJson from './liberationQuests.json';

type LiberationEntry = {
	img: string;
	points: number;
};

type RawLiberationQuest = {
	total: number;
	[key: string]: number | LiberationEntry;
};

export type LiberationQuest = {
	total: number;
	bosses: Record<string, LiberationEntry>;
};

type LiberationMilestones = Record<string, LiberationQuest>;

const normalizeLiberationData = (raw: Record<string, RawLiberationQuest>): LiberationMilestones => {
	const result: LiberationMilestones = {};

	for (const [questName, questData] of Object.entries(raw)) {
		const bosses: Record<string, LiberationEntry> = {};

		for (const [key, value] of Object.entries(questData)) {
			if (key === 'total') {
				continue;
			}

			bosses[key] = value as LiberationEntry;
		}

		result[questName] = { total: questData.total, bosses };
	}

	return result;
};

const liberationMilestones: LiberationMilestones = normalizeLiberationData(
	liberationQuestsJson as Record<string, RawLiberationQuest>,
);

type LiberationMap = Map<string, Map<string, LiberationEntry>>;

const createLiberationMap = (data: LiberationMilestones): LiberationMap => {
	return new Map(
		Object.entries(data).map(([questName, questData]): [string, Map<string, LiberationEntry>] => [
			questName,
			new Map(Object.entries(questData.bosses)),
		]),
	);
};

const liberationMap: LiberationMap = createLiberationMap(liberationMilestones);

// For Zod Validation
const questTypesArray = Object.keys(liberationQuestsJson) as Array<keyof typeof liberationQuestsJson>;

export const questTypes = questTypesArray as unknown as readonly [
	keyof typeof liberationQuestsJson,
	...(keyof typeof liberationQuestsJson)[],
];

const extractBossNamesByQuest = (): { genesisBossNames: string[]; destinyBossNames: string[] } => {
	const genesisBosses: string[] = [];
	const destinyBosses: string[] = [];

	for (const [questType, quest] of Object.entries(liberationQuestsJson)) {
		for (const key of Object.keys(quest)) {
			if (key === 'total') {
				continue;
			}

			if (questType === 'Genesis') {
				genesisBosses.push(key);
			} else if (questType === 'Destiny') {
				destinyBosses.push(key);
			}
		}
	}

	return { genesisBossNames: genesisBosses, destinyBossNames: destinyBosses };
};
const { genesisBossNames, destinyBossNames } = extractBossNamesByQuest();

export const genesisBosses = genesisBossNames as unknown as readonly [string, ...string[]];
export const destinyBosses = destinyBossNames as unknown as readonly [string, ...string[]];

// Aux functions

export const getQuestsByType = (questType: string): LiberationQuest | null => {
	return liberationMilestones[questType] ?? null;
};

export const getLiberationPoints = (questType: string, bossName: string): number => {
	return liberationMap.get(questType)?.get(bossName)?.points ?? 0;
};

export const getCumulativeLiberationPoints = (
	questType: string,
	bossName: string,
	includeTargetBoss: boolean = false,
): number => {
	const quest = liberationMilestones[questType];

	if (!quest) {
		return 0;
	}

	let totalPoints = 0;

	for (const [currentBossName, entry] of Object.entries(quest.bosses)) {
		totalPoints += entry.points;

		if (currentBossName === bossName) {
			if (!includeTargetBoss) {
				totalPoints -= entry.points;
			}

			break;
		}
	}

	return totalPoints;
};

export const getLiberationTotal = (questName: string): number => {
	return liberationMilestones[questName]?.total ?? 0;
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

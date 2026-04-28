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

export type LiberationMilestones = Record<string, LiberationQuest>;

const normalizeLiberationData = (raw: Record<string, RawLiberationQuest>): LiberationMilestones => {
	const result: LiberationMilestones = {};

	for (const [questName, questData] of Object.entries(raw)) {
		const bosses: Record<string, LiberationEntry> = {};

		for (const [key, value] of Object.entries(questData)) {
			if (key === 'total') continue;

			bosses[key] = value as LiberationEntry;
		}

		result[questName] = {
			total: questData.total,
			bosses,
		};
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

export type QuestType = (typeof questTypes)[number];

const extractBossNames = (): string[] => {
	const result: string[] = [];

	for (const quest of Object.values(liberationQuestsJson)) {
		for (const key of Object.keys(quest)) {
			if (key === 'total') continue;
			result.push(key);
		}
	}

	return result;
};

const bossNamesArray = extractBossNames();

export const bossNames = bossNamesArray as unknown as readonly [string, ...string[]];

export type BossName = (typeof bossNames)[number];

// Aux functions

export const getQuestsByType = (questType: string): LiberationQuest | null => {
	return liberationMilestones[questType] ?? null;
};

export const getLiberationBossImage = (questName: string, bossName: string): string => {
	return liberationMap.get(questName)?.get(bossName)?.img ?? '';
};

export const getLiberationPoints = (questName: string, bossName: string): number => {
	return liberationMap.get(questName)?.get(bossName)?.points ?? 0;
};

export const getCumulativeLiberationPoints = (questName: string, bossName: string): number => {
	const quest = liberationMilestones[questName];

	if (!quest) {
		return 0;
	}

	let totalPointsBeforeBoss = 0;

	for (const [currentBossName, entry] of Object.entries(quest.bosses)) {
		if (currentBossName === bossName) {
			break;
		}

		totalPointsBeforeBoss += entry.points;
	}

	return totalPointsBeforeBoss;
};

export const getLiberationTotal = (questName: string): number => {
	return liberationMilestones[questName]?.total ?? 0;
};

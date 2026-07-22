import sacredAreasJson from './astraDaily.json';

type SacredArea = {
	name: string;
	img: string;
	erion: number;
};

const sacredAreas: SacredArea[] = sacredAreasJson;

const sacredAreaErionMap = new Map(sacredAreas.map(({ name, erion }): [string, number] => [name, erion]));

export const ASTRA_DAILY_AREAS = [...new Set(sacredAreas.map((area) => area.name))] as unknown as [string, ...string[]];

export const getSacredAreas = (): readonly SacredArea[] => sacredAreas;

const getSacredAreaErion = (areaName: string): number => sacredAreaErionMap.get(areaName) ?? 0;

export const hasSacredArea = (areaName: string): boolean => sacredAreaErionMap.has(areaName);

export const getErionDifference = (storedAreaName: string, completedAreaName: string): number => {
	const storedPoints = getSacredAreaErion(storedAreaName);
	const completedPoints = getSacredAreaErion(completedAreaName);

	return Math.max(0, completedPoints - storedPoints);
};

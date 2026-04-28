import { getLiberationPoints, getCumulativeLiberationPoints } from '@data/liberation/liberationQuests';

export const calculateQuestPoints = (boss: string | null, type: string): number => {
	if (!boss) {
		return 0;
	}
	return getLiberationPoints(type, boss);
};

export const calculateCumulativePoints = (boss: string | null, type: string, traces: number): number => {
	if (!boss) {
		return 0;
	}
	return getCumulativeLiberationPoints(type, boss) + traces;
};

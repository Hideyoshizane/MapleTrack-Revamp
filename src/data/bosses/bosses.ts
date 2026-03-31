import { isRebootServer } from '../servers/servers';

import bossesJson from './bosses.json';

export type BossDifficulty = {
	name: string;
	value: number;
	reset: 'Daily' | 'Weekly' | 'Monthly';
	minLevel: number;
};

export type Boss = {
	name: string;
	img: string;
	difficulties: BossDifficulty[];
};

export const bosses: Boss[] = bossesJson as Boss[];

export const getBossDifficultyValue = (bossName: string, difficultyName: string, serverName: string): number | null => {
	const boss = bosses.find((b) => b.name === bossName);
	if (!boss) {
		return null;
	}
	const difficulty: BossDifficulty | undefined = boss.difficulties.find((d) => d.name === difficultyName);
	if (!difficulty) {
		return null;
	}

	return isRebootServer(serverName) ? difficulty.value * 5 : difficulty.value;
};

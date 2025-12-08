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

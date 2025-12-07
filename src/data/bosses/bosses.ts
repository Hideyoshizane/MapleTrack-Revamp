import bossesJson from './bosses.json';

export interface BossDifficulty {
	name: string;
	value: number;
	reset: 'Daily' | 'Weekly' | 'Monthly';
	minLevel: number;
}

export interface Boss {
	name: string;
	img: string;
	difficulties: BossDifficulty[];
}

export const bosses: Boss[] = bossesJson as Boss[];

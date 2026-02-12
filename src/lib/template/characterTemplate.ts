import { DEFAULT_WEEKLY_TRIES } from '@data/character/constants';

import type { CharacterSymbolDraft } from '@features/character/characterModel';

export const characterSymbolsTemplate: CharacterSymbolDraft[] = [
	// ARCANE
	{
		name: 'Vanishing Journey',
		level: 1,
		exp: 1,
		category: 'arcane',
		content: [
			{ contentType: 'Daily Quest', checked: true, cleared: false, date: null },
			{ contentType: 'Erda Spectrum', checked: false, tries: DEFAULT_WEEKLY_TRIES, cleared: false, date: null },
			{ contentType: 'Reverse City', checked: false, cleared: false, date: null },
		],
	},
	{
		name: 'Chu Chu Island',
		level: 1,
		exp: 1,
		category: 'arcane',
		content: [
			{ contentType: 'Daily Quest', checked: true, cleared: false, date: null },
			{ contentType: 'Hungry Muto', checked: false, tries: DEFAULT_WEEKLY_TRIES, cleared: false, date: null },
			{ contentType: 'Yum Yum Island', checked: false, cleared: false, date: null },
		],
	},
	{
		name: 'Lachelein',
		level: 1,
		exp: 1,
		category: 'arcane',
		content: [
			{ contentType: 'Daily Quest', checked: true, cleared: false, date: null },
			{ contentType: 'Midnight Chaser', checked: false, tries: DEFAULT_WEEKLY_TRIES, cleared: false, date: null },
		],
	},
	{
		name: 'Arcana',
		level: 1,
		exp: 1,
		category: 'arcane',
		content: [
			{ contentType: 'Daily Quest', checked: true, cleared: false, date: null },
			{ contentType: 'Spirit Savior', checked: false, tries: DEFAULT_WEEKLY_TRIES, cleared: false, date: null },
		],
	},
	{
		name: 'Morass',
		level: 1,
		exp: 1,
		category: 'arcane',
		content: [
			{ contentType: 'Daily Quest', checked: true, cleared: false, date: null },
			{ contentType: 'Ranheim Defense', checked: false, tries: DEFAULT_WEEKLY_TRIES, cleared: false, date: null },
		],
	},
	{
		name: 'Esfera',
		level: 1,
		exp: 1,
		category: 'arcane',
		content: [
			{ contentType: 'Daily Quest', checked: true, cleared: false, date: null },
			{ contentType: 'Esfera Guardian', checked: false, tries: DEFAULT_WEEKLY_TRIES, cleared: false, date: null },
		],
	},
	// SACRED
	{
		name: 'Cernium',
		level: 1,
		exp: 1,
		category: 'sacred',
		content: [{ contentType: 'Daily Quest', checked: true, cleared: false, date: null }],
	},
	{
		name: 'Arcus',
		level: 1,
		exp: 1,
		category: 'sacred',
		content: [{ contentType: 'Daily Quest', checked: true, cleared: false, date: null }],
	},
	{
		name: 'Odium',
		level: 1,
		exp: 1,
		category: 'sacred',
		content: [{ contentType: 'Daily Quest', checked: true, cleared: false, date: null }],
	},
	{
		name: 'Shangri-La',
		level: 1,
		exp: 1,
		category: 'sacred',
		content: [{ contentType: 'Daily Quest', checked: true, cleared: false, date: null }],
	},
	{
		name: 'Arteria',
		level: 1,
		exp: 1,
		category: 'sacred',
		content: [{ contentType: 'Daily Quest', checked: true, cleared: false, date: null }],
	},
	{
		name: 'Carcion',
		level: 1,
		exp: 1,
		category: 'sacred',
		content: [{ contentType: 'Daily Quest', checked: true, cleared: false, date: null }],
	},
	// GRAND SACRED
	{
		name: 'Tallahart',
		level: 1,
		exp: 1,
		category: 'grand',
		content: [{ contentType: 'Daily Quest', checked: true, cleared: false, date: null }],
	},
];

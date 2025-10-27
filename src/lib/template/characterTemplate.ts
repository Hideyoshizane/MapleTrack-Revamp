import { DEFAULT_WEEKLY_TRIES } from '@data/character/constants';

import type { CharacterDocument } from '@models/character';

export const templateCharacter: Partial<CharacterDocument> = {
	name: 'Character Name',
	level: 0,
	targetLevel: 10,
	bossing: false,
	syncing: false,
	ArcaneSymbol: [
		{
			name: 'Vanishing Journey',
			level: 1,
			exp: 1,
			category: 'arcane',
			content: [
				{ contentType: 'Daily Quest', checked: true, cleared: false, date: null },
				{
					contentType: 'Erda Spectrum',
					checked: false,
					tries: DEFAULT_WEEKLY_TRIES,
					date: null,
					cleared: false,
				},
				{ contentType: 'Reverse City', checked: false },
			],
		},
		{
			name: 'Chu Chu Island',
			level: 1,
			exp: 1,
			category: 'arcane',
			content: [
				{ contentType: 'Daily Quest', checked: true, cleared: false, date: null },
				{
					contentType: 'Hungry Muto',
					checked: false,
					tries: DEFAULT_WEEKLY_TRIES,
					cleared: false,
					date: null,
				},
				{ contentType: 'Yum Yum Island', checked: false },
			],
		},
		{
			name: 'Lachelein',
			level: 1,
			exp: 1,
			category: 'arcane',
			content: [
				{
					contentType: 'Daily Quest',
					checked: true,
					date: null,
					cleared: false,
				},
				{
					contentType: 'Midnight Chaser',
					checked: false,
					tries: DEFAULT_WEEKLY_TRIES,
					cleared: false,
					date: null,
				},
			],
		},
		{
			name: 'Arcana',
			level: 1,
			exp: 1,
			category: 'arcane',
			content: [
				{
					contentType: 'Daily Quest',
					checked: true,
					date: null,
					cleared: false,
				},
				{
					contentType: 'Spirit Savior',
					checked: false,
					tries: DEFAULT_WEEKLY_TRIES,
					date: null,
					cleared: false,
				},
			],
		},
		{
			name: 'Morass',
			level: 1,
			exp: 1,
			category: 'arcane',
			content: [
				{
					contentType: 'Daily Quest',
					checked: true,
					date: null,
					cleared: false,
				},
				{
					contentType: 'Ranheim Defense',
					checked: false,
					tries: DEFAULT_WEEKLY_TRIES,
					date: null,
					cleared: false,
				},
			],
		},
		{
			name: 'Esfera',
			level: 1,
			exp: 1,
			category: 'arcane',
			content: [
				{
					contentType: 'Daily Quest',
					checked: true,
					date: null,
					cleared: false,
				},
				{
					contentType: 'Esfera Guardian',
					checked: false,
					tries: DEFAULT_WEEKLY_TRIES,
					date: null,
					cleared: false,
				},
			],
		},
	],
	SacredSymbol: [
		{
			name: 'Cernium',
			level: 1,
			exp: 1,
			category: 'sacred',
			content: [
				{
					contentType: 'Daily Quest',
					checked: true,
					date: null,
					cleared: false,
				},
			],
		},
		{
			name: 'Arcus',
			level: 1,
			exp: 1,
			category: 'sacred',
			content: [
				{
					contentType: 'Daily Quest',
					checked: true,
					date: null,
					cleared: false,
				},
			],
		},
		{
			name: 'Odium',
			level: 1,
			exp: 1,
			category: 'sacred',
			content: [
				{
					contentType: 'Daily Quest',
					checked: true,
					date: null,
					cleared: false,
				},
			],
		},
		{
			name: 'Shangri-La',
			level: 1,
			exp: 1,
			category: 'sacred',
			content: [
				{
					contentType: 'Daily Quest',
					checked: true,
					date: null,
					cleared: false,
				},
			],
		},
		{
			name: 'Arteria',
			level: 1,
			exp: 1,
			category: 'sacred',
			content: [
				{
					contentType: 'Daily Quest',
					checked: true,
					date: null,
					cleared: false,
				},
			],
		},
		{
			name: 'Carcion',
			level: 1,
			exp: 1,
			category: 'sacred',
			content: [
				{
					contentType: 'Daily Quest',
					checked: true,
					date: null,
					cleared: false,
				},
			],
		},
	],
	GrandSacredSymbol: [
		{
			name: 'Tallahart',
			level: 1,
			exp: 1,
			category: 'grand',
			content: [{ contentType: 'Daily Quest', checked: true, cleared: false, date: null }],
		},
	],
};

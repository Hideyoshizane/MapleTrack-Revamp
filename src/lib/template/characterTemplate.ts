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
				{ contentType: 'Daily Quest', checked: true, date: null },
				{
					contentType: 'Erda Spectrum',
					checked: false,
					tries: DEFAULT_WEEKLY_TRIES,
					date: null,
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
				{ contentType: 'Daily Quest', checked: true, date: null },
				{
					contentType: 'Hungry Muto',
					checked: false,
					tries: DEFAULT_WEEKLY_TRIES,
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
				},
				{
					contentType: 'Midnight Chaser',
					checked: false,
					tries: DEFAULT_WEEKLY_TRIES,
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
				},
				{
					contentType: 'Spirit Savior',
					checked: false,
					tries: DEFAULT_WEEKLY_TRIES,
					date: null,
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
				},
				{
					contentType: 'Ranheim Defense',
					checked: false,
					tries: DEFAULT_WEEKLY_TRIES,
					date: null,
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
				},
				{
					contentType: 'Esfera Guardian',
					checked: false,
					tries: DEFAULT_WEEKLY_TRIES,
					date: null,
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
			content: [{ contentType: 'Daily Quest', checked: true, date: null }],
		},
	],
};

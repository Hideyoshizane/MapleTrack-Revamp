import { create } from 'zustand';

import type { BossCharacter, BossServer, Boss } from '@features/Boss/bossListModel';

export type BossListState = {
	name: string | null;
	weeklyBosses: number;
	totalGains: number;

	characters: BossCharacter[];

	selectedCharacter: BossCharacter | null;

	selectedBosses: Boss[];

	hydrate: (data: BossServer) => void;
	setSelectedCharacter: (char: BossCharacter) => void;

	addOrReplaceBoss: (boss: Boss) => void;
	removeBossFromSelected: (name: string, reset: Boss['reset']) => void;
};

export const useBossListStore = create<BossListState>(
	(set, get): BossListState => ({
		name: null,
		weeklyBosses: 0,
		totalGains: 0,
		characters: [],

		selectedCharacter: null,
		selectedBosses: [],

		// hydrate store from DB
		hydrate: (data: BossServer): void => {
			set(
				(): Partial<BossListState> => ({
					name: data.name,
					weeklyBosses: data.weeklyBosses,
					totalGains: data.totalGains,
					characters: data.characters.map(
						(c): BossCharacter => ({
							...c,
							bosses: [...c.bosses],
						})
					),
					selectedCharacter: {
						...data.characters[0],
						bosses: [...data.characters[0].bosses],
					},
				})
			);

			console.log('STORE UPDATED:', get());
		},

		setSelectedCharacter: (char: BossCharacter): void => {
			try {
				// Clone to avoid accidental mutation
				const cloned = { ...char, bosses: [...char.bosses] };

				set(
					(): Partial<BossListState> => ({
						selectedCharacter: cloned,
						selectedBosses: [...cloned.bosses],
					})
				);

				console.log('STORE UPDATED:', get().selectedCharacter);
			} catch (err) {
				console.error('Error in setSelectedCharacter:', err);
				throw err;
			}
		},

		addOrReplaceBoss: (boss: Boss): void => {
			const state = get();
			if (!state.selectedCharacter) {
				return;
			}

			const char: BossCharacter = state.selectedCharacter;

			const list: Boss[] = [...char.bosses];

			const indicesSameName: number[] = list
				.map((b, i): number => (b.name === boss.name ? i : -1))
				.filter((i): boolean => i !== -1);

			let updatedBosses: Boss[];

			if (indicesSameName.length === 0) {
				updatedBosses = [...list, boss];
			} else {
				let replaced = false;

				updatedBosses = list.map((b, idx): Boss => {
					if (indicesSameName.includes(idx) && b.reset === boss.reset) {
						replaced = true;
						return boss;
					}
					return b;
				});

				if (!replaced) {
					updatedBosses.push(boss);
				}
			}

			const updatedCharacters: BossCharacter[] = state.characters.map(
				(c): BossCharacter => (c.name === char.name ? { ...c, bosses: updatedBosses } : c)
			);

			set(
				(): Partial<BossListState> => ({
					characters: updatedCharacters,
					selectedCharacter: { ...char, bosses: updatedBosses },
					selectedBosses: [...updatedBosses],
				})
			);

			console.log('STORE UPDATED:', get());
		},

		removeBossFromSelected: (name: string, reset: Boss['reset']): void => {
			const state = get();
			if (!state.selectedCharacter) {
				return;
			}

			const char: BossCharacter = state.selectedCharacter;

			const updatedBosses: Boss[] = char.bosses.filter((b): boolean => !(b.name === name && b.reset === reset));

			const updatedCharacters: BossCharacter[] = state.characters.map(
				(c): BossCharacter => (c.name === char.name ? { ...c, bosses: updatedBosses } : c)
			);

			set(
				(): Partial<BossListState> => ({
					characters: updatedCharacters,
					selectedCharacter: { ...char, bosses: updatedBosses },
					selectedBosses: [...updatedBosses],
				})
			);

			console.log('STORE UPDATED:', get());
		},
	})
);

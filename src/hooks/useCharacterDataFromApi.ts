'use client';

import { useState, useEffect } from 'react';

import { characterApi } from '@features/character/characterService';

import type { Character, CharacterDataFromAPI } from '@sharedTypes/character';

type characterDataFromApiProps = {
	character?: Character;
	committedName?: string;
	server: string;
	characterLoading: boolean;
	refreshKey?: number;
};
type characterDataFromApiReturn = {
	characterDataApi: CharacterDataFromAPI | null;
	characterDataApiFailed: boolean;
	loading: boolean;
};

export const useCharacterDataFromApi = ({
	character,
	committedName,
	server,
	characterLoading,
	refreshKey = 0,
}: characterDataFromApiProps): characterDataFromApiReturn => {
	const [characterDataApi, setCharacterDataApi] = useState<CharacterDataFromAPI | null>(null);
	const [characterDataApiFailed, setCharacterDataApiFailed] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect((): void => {
		const isSyncing = character?.syncing;
		const charName = committedName ?? character?.name;

		if (!isSyncing || !charName || characterLoading) {
			return;
		}

		const fetchExtraData = async (): Promise<void> => {
			setLoading(true);
			setCharacterDataApi(null);
			setCharacterDataApiFailed(false);

			try {
				const response = await characterApi.getCharacterDataFromAPI(charName, server);

				if (response.success && response.data) {
					setCharacterDataApi(response.data);
				} else {
					setCharacterDataApiFailed(true);
				}
			} catch (err: unknown) {
				if (err instanceof Error) {
					console.error('Error fetching extra character data:', err.message);
				} else {
					console.error('Unknown error fetching extra character data:', err);
				}
				setCharacterDataApiFailed(true);
			} finally {
				setLoading(false);
			}
		};

		void fetchExtraData();
	}, [character?.syncing, committedName, characterLoading, character?.name, server, refreshKey]);

	return { characterDataApi, characterDataApiFailed, loading };
};

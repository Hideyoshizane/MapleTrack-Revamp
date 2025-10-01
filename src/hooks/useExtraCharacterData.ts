'use client';

import { useState, useEffect } from 'react';

import type { Character, ExtraCharacterData, GetExtraCharacterDataApiResponse } from '@sharedTypes/character';

interface UseExtraCharacterDataProps {
	character?: Character;
	committedName?: string;
	server: string;
	characterLoading: boolean;
	refreshKey?: number;
}

interface UseExtraCharacterDataReturn {
	extraData: ExtraCharacterData | null;
	extraDataFailed: boolean;
	loading: boolean;
}

export const useExtraCharacterData = ({
	character,
	committedName,
	server,
	characterLoading,
	refreshKey = 0,
}: UseExtraCharacterDataProps): UseExtraCharacterDataReturn => {
	const [extraData, setExtraData] = useState<ExtraCharacterData | null>(null);
	const [extraDataFailed, setExtraDataFailed] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect((): void => {
		const isSyncing = character?.syncing;
		const charName = committedName ?? character?.name;

		if (!isSyncing || !charName) return;
		if (characterLoading) return;

		const fetchExtraData = async (): Promise<void> => {
			setLoading(true);
			setExtraData(null);
			setExtraDataFailed(false);

			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_URL}/api/characters/getCharacterDataFromAPI?character_name=${charName}&server=${server}`
				);
				if (!res.ok) {
					setExtraDataFailed(true);
					return;
				}

				const data: GetExtraCharacterDataApiResponse = await res.json();
				if (data.success && data.data) {
					setExtraData(data.data);
					setExtraDataFailed(false);
				} else {
					setExtraDataFailed(true);
				}
			} catch (err) {
				console.error('Error fetching extra character data', err);
				setExtraDataFailed(true);
			} finally {
				setLoading(false);
			}
		};

		void fetchExtraData();
	}, [character?.syncing, committedName, characterLoading, character?.name, server, refreshKey]);

	return { extraData, extraDataFailed, loading };
};

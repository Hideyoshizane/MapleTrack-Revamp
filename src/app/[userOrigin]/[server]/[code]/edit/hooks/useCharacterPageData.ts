'use client';

import { useState, useEffect } from 'react';

import { useCharacterData } from '@hooks/useCharacterData';
import { useCharacterDataFromApi } from '@hooks/useCharacterDataFromApi';

import type { Character } from '@sharedTypes/character';

interface UseCharacterPageDataProps {
	userOrigin: string;
	server: string;
	code: string;
}

interface UseCharacterPageDataReturn {
	character?: Character;
	committedName: string;
	setCommittedName: React.Dispatch<React.SetStateAction<string>>;
	loading: boolean;
	error?: string;
	characterDataApi: any;
	characterDataApiFailed: boolean;
	handleSyncToggle: () => void;
}

export const useCharacterPageData = ({
	userOrigin,
	server,
	code,
}: UseCharacterPageDataProps): UseCharacterPageDataReturn => {
	const {
		character,
		setCharacter,
		committedName,
		setCommittedName,
		loading: characterLoading,
		error,
	} = useCharacterData({ userOrigin, server, code });

	const [refreshKey, setRefreshKey] = useState(0);
	const [firstLoadDone, setFirstLoadDone] = useState(false);

	const handleSyncToggle = (): void => {
		if (!character) return;
		setCharacter({ ...character, syncing: !character.syncing });
		setRefreshKey((prev): number => prev + 1); // triggers re-fetch
	};

	const {
		characterDataApi,
		characterDataApiFailed,
		loading: extraDataLoading,
	} = useCharacterDataFromApi({
		character,
		committedName,
		server,
		characterLoading,
		refreshKey,
	});

	// Mark first load done after both character and extra data are fetched
	useEffect((): void => {
		if (!characterLoading && !extraDataLoading) {
			queueMicrotask(() => {
				setFirstLoadDone(true);
			});
		}
	}, [characterLoading, extraDataLoading]);

	const loading = firstLoadDone ? false : characterLoading || extraDataLoading;

	return {
		character,
		committedName,
		setCommittedName,
		loading,
		error: error ?? undefined,
		characterDataApi,
		characterDataApiFailed,
		handleSyncToggle,
	};
};

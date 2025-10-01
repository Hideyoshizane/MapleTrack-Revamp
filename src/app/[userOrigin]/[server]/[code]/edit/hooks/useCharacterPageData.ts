'use client';

import { useState, useEffect } from 'react';

import { useCharacterData } from '@hooks/useCharacterData';
import { useExtraCharacterData } from '@hooks/useExtraCharacterData';

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
	extraData: any;
	extraDataFailed: boolean;
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
		extraData,
		extraDataFailed,
		loading: extraDataLoading,
	} = useExtraCharacterData({
		character,
		committedName,
		server,
		characterLoading,
		refreshKey,
	});

	// Mark first load done after both character and extra data are fetched
	useEffect((): void => {
		if (!characterLoading && !extraDataLoading) setFirstLoadDone(true);
	}, [characterLoading, extraDataLoading]);

	const loading = firstLoadDone ? false : characterLoading || extraDataLoading;

	return {
		character,
		committedName,
		setCommittedName,
		loading,
		error: error ?? undefined,
		extraData,
		extraDataFailed,
		handleSyncToggle,
	};
};

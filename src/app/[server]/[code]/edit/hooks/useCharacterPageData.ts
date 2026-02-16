'use client';
import { produce } from 'immer';
import { useState, useEffect } from 'react';

import { useCharacterExternalQuery } from '@hooks/useCharacterExternalQuery';
import { useCharacterQuery } from '@hooks/useCharacterQuery';

import type { CharacterDataFromAPI } from '@features/character/characterApi';
import type { CharacterDraft as Character } from '@features/character/characterModel';

type UseCharacterPageDataProps = {
	userOrigin: string;
	server: string;
	code: string;
	nameOverride?: string;
	syncEnabled: boolean;
	setFirstLoad: React.Dispatch<React.SetStateAction<boolean>>;
};

type UseCharacterPageDataReturn = {
	character: Character | null;
	updateCharacter: (recipe: (draft: Character) => void) => void;
	loading: boolean;
	error?: string;
	CharacterDataFromAPI: CharacterDataFromAPI | null;
	CharacterDataFromAPIFailed: boolean;
};

export const useCharacterPageData = ({
	userOrigin,
	server,
	code,
	nameOverride,
	syncEnabled,
	setFirstLoad,
}: UseCharacterPageDataProps): UseCharacterPageDataReturn => {
	// Main character data
	const { data: serverCharacter, isLoading: characterLoading, error } = useCharacterQuery({ userOrigin, server, code });
	const [editableCharacter, setEditableCharacter] = useState<Character | null>(() => serverCharacter ?? null);

	useEffect(() => {
		if (serverCharacter && serverCharacter !== editableCharacter) {
			setEditableCharacter(serverCharacter);
		}
		setFirstLoad(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [serverCharacter]);

	const updateCharacter = (recipe: (draft: Character) => void): void => {
		setEditableCharacter((prev) => {
			if (!prev) {
				return prev;
			}

			return produce(prev, recipe);
		});
	};

	const resolvedName: string | undefined = nameOverride ?? editableCharacter?.name;

	// External API data
	const {
		data: extraData,
		isLoading: extraLoading,
		isError: CharacterDataFromAPIFailed,
	} = useCharacterExternalQuery({
		name: resolvedName,
		server,
		enabled: syncEnabled && !!resolvedName,
	});

	return {
		character: editableCharacter,
		updateCharacter,
		loading: characterLoading || extraLoading,
		error: error instanceof Error ? error.message : undefined,
		CharacterDataFromAPI: extraData ?? null,
		CharacterDataFromAPIFailed,
	};
};

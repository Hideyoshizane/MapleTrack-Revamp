'use client';
import { produce } from 'immer';
import { useState, useEffect } from 'react';

import { useCharacterExternalQuery } from '@hooks/useCharacterExternalQuery';
import { useCharacterQuery } from '@hooks/useCharacterQuery';

import type {
	getCharacterDataFromAPIResponseBody,
	getCharacterDataResponseBody,
} from '@features/character/schemas/character.response.schema';

type UseCharacterPageDataProps = {
	server: string;
	className: string;
	nameOverride?: string;
	syncEnabled: boolean;
	setFirstLoad: React.Dispatch<React.SetStateAction<boolean>>;
};

type UseCharacterPageDataReturn = {
	character: getCharacterDataResponseBody | null;
	updateCharacter: (recipe: (draft: getCharacterDataResponseBody) => void) => void;
	loading: boolean;
	error?: string;
	CharacterDataFromAPI: getCharacterDataFromAPIResponseBody | null;
	CharacterDataFromAPIFailed: boolean;
};

export const useCharacterPageData = ({
	server,
	className,
	nameOverride,
	syncEnabled,
	setFirstLoad,
}: UseCharacterPageDataProps): UseCharacterPageDataReturn => {
	// Main character data
	const { data: serverCharacter, isLoading: characterLoading, error } = useCharacterQuery({ server, className });
	const [editableCharacter, setEditableCharacter] = useState<getCharacterDataResponseBody | null>(
		() => serverCharacter ?? null,
	);

	useEffect(() => {
		if (serverCharacter && serverCharacter !== editableCharacter) {
			setEditableCharacter(serverCharacter);
		}
		setFirstLoad(false);
	}, [serverCharacter]);

	const updateCharacter = (recipe: (draft: getCharacterDataResponseBody) => void): void => {
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
	} = useCharacterExternalQuery({ name: resolvedName, server, enabled: syncEnabled && !!resolvedName });

	return {
		character: editableCharacter,
		updateCharacter,
		loading: characterLoading || extraLoading,
		error: error instanceof Error ? error.message : undefined,
		CharacterDataFromAPI: extraData ?? null,
		CharacterDataFromAPIFailed,
	};
};

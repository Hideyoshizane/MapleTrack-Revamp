'use client';
import { produce } from 'immer';
import { useState } from 'react';

import { useCharacterExternalQuery } from '@hooks/useCharacterExternalQuery';
import { useCharacterQuery } from '@hooks/useCharacterQuery';

import type {
	getCharacterDataFromAPIResponseBody,
	getCharacterDataResponseBody,
} from '@features/character/schemas/character.response.schema';

type Props = {
	server: string;
	className: string;
	nameOverride?: string;
	syncEnabled: boolean;
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
}: Props): UseCharacterPageDataReturn => {
	// Main character data
	const { data: serverCharacter, isLoading: characterLoading, error } = useCharacterQuery({ server, className });
	const [editableCharacter, setEditableCharacter] = useState<getCharacterDataResponseBody | null>(null);

	const character = editableCharacter ?? serverCharacter ?? null;

	const updateCharacter = (recipe: (draft: getCharacterDataResponseBody) => void): void => {
		setEditableCharacter((previous) => {
			const currentCharacter = previous ?? serverCharacter;

			if (!currentCharacter) {
				return null;
			}

			return produce(currentCharacter, recipe);
		});
	};

	const resolvedName = nameOverride ?? editableCharacter?.name ?? serverCharacter?.name;

	// External API data
	const {
		data: extraData,
		isLoading: extraLoading,
		isError: CharacterDataFromAPIFailed,
	} = useCharacterExternalQuery({ name: resolvedName, server, enabled: syncEnabled && !!resolvedName });

	return {
		character,
		updateCharacter,
		loading: characterLoading || extraLoading,
		error: error instanceof Error ? error.message : undefined,
		CharacterDataFromAPI: extraData ?? null,
		CharacterDataFromAPIFailed,
	};
};

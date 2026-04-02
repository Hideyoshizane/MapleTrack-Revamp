'use client';

import { useState, useEffect } from 'react';

import { characterClientSchema } from '@features/character/character.client.schema';

import type { CharacterDraft as Character } from '@features/character/characterModel';
import type { Dispatch, SetStateAction } from 'react';

type UseCharacterInputsProps = {
	character: Character | null;
	updateCharacter: (recipe: (draft: Character) => void) => void;
	setSyncEnabled: (value: boolean) => void;
};

export type UseCharacterInputsReturn = {
	levelInput: string;
	setLevelInput: Dispatch<SetStateAction<string>>;
	targetLevelInput: string;
	setTargetLevelInput: Dispatch<SetStateAction<string>>;
	nameError: string | null;
	handleNameBlur: (value: string) => void;
	toggleBossing: () => void;
	handleLevelBlur: () => void;
	handleTargetLevelBlur: () => void;
	syncEnabled: boolean;
	toggleSync: () => void;
};

export const useCharacterInputs = ({
	character,
	updateCharacter,
	setSyncEnabled,
}: UseCharacterInputsProps): UseCharacterInputsReturn => {
	const [levelInput, setLevelInput] = useState<string>(() => character?.level.toString() ?? '');
	const [targetLevelInput, setTargetLevelInput] = useState<string>(() => character?.targetLevel.toString() ?? '');
	const [syncEnabled, setLocalSyncEnabled] = useState<boolean>(() => !!character?.syncing);

	useEffect(() => {
		if (character?.syncing) {
			setTimeout(() => {
				setLocalSyncEnabled(true);
				setSyncEnabled(true);
			}, 0);
		}
	}, [character, setSyncEnabled]);

	if (!character) {
		return {
			levelInput,
			setLevelInput,
			targetLevelInput,
			setTargetLevelInput,
			nameError: null,
			syncEnabled,
			handleNameBlur: (): void => {},
			toggleBossing: (): void => {},
			handleLevelBlur: (): void => {},
			handleTargetLevelBlur: (): void => {},
			toggleSync: (): void => {},
		};
	}

	const nameError: string | null =
		character.name === 'Character Name' || !character.name.trim() ? 'Please enter a valid name' : null;
	const handleNameBlur = (value: string): void => {
		const result = characterClientSchema.shape.characterName.safeParse(value);
		if (!result.success) {
			return;
		}

		updateCharacter((draft) => {
			draft.name = result.data;
		});
	};

	const toggleBossing = (): void => {
		updateCharacter((draft) => {
			draft.bossing = !draft.bossing;
		});
	};

	const handleLevelBlur = (): void => {
		updateCharacter((draft) => {
			if (!draft) {
				return;
			}
			draft.level = levelInput === '' ? draft.level : Number(levelInput);
		});
	};

	const handleTargetLevelBlur = (): void => {
		updateCharacter((draft) => {
			if (!draft) {
				return;
			}
			draft.targetLevel = targetLevelInput === '' ? draft.targetLevel : Number(targetLevelInput);
		});
	};

	const toggleSync = (): void => {
		if (!character) {
			return;
		}
		const next = !syncEnabled;

		updateCharacter((draft) => {
			draft.syncing = next;
		});

		setLocalSyncEnabled(next);
		setSyncEnabled(next);
	};

	return {
		levelInput,
		setLevelInput,
		targetLevelInput,
		setTargetLevelInput,
		nameError,
		handleNameBlur,
		toggleBossing,
		handleLevelBlur,
		handleTargetLevelBlur,
		syncEnabled,
		toggleSync,
	};
};

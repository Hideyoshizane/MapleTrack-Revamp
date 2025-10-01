'use client';

import { useEffect, useState } from 'react';

import { checkCharacterName } from '@schemas/characterNameSchema';

import type { Character } from '@sharedTypes/character';

interface UseCharacterInputsReturn {
	character?: Character;
	setCharacter: React.Dispatch<React.SetStateAction<Character | undefined>>;
	committedName?: string;
	levelInput: string;
	setLevelInput: React.Dispatch<React.SetStateAction<string>>;
	targetLevelInput: string;
	setTargetLevelInput: React.Dispatch<React.SetStateAction<string>>;
	nameError: string | null;
	handleNameBlur: (value: string) => void;
	updateCharacter: (patch: Partial<Character>) => void;
	toggleBossing: () => void;
}

export const useCharacterInputs = (initialCharacter?: Character): UseCharacterInputsReturn => {
	const [character, setCharacter] = useState<Character | undefined>(initialCharacter);
	const committedName = initialCharacter?.name;
	const [levelInput, setLevelInput] = useState('');
	const [targetLevelInput, setTargetLevelInput] = useState('');
	const [nameError, setNameError] = useState<string | null>(null);

	// Set initial nameError when initialCharacter.name is "Character Name"
	useEffect((): void => {
		if (initialCharacter?.name === 'Character Name') {
			setNameError('Please enter a valid name');
		} else {
			setNameError(null);
		}
	}, [initialCharacter?.name]);

	// Sync when initialCharacter changes
	useEffect((): void => {
		if (!initialCharacter) return;
		setCharacter(initialCharacter);
		setLevelInput(initialCharacter.level?.toString() ?? '');
		setTargetLevelInput(initialCharacter.targetLevel?.toString() ?? '');
	}, [initialCharacter]);

	const updateCharacter = (patch: Partial<Character>): void => {
		setCharacter((prev): Character | undefined => (prev ? { ...prev, ...patch } : undefined));
	};

	const handleNameBlur = (value: string): void => {
		const error: string | null = checkCharacterName(value);
		setNameError(error);
		// Only update parent if name is valid
		if (!error) {
			updateCharacter({ name: value });
		}
	};

	const toggleBossing = (): void => {
		setCharacter((prev): Character | undefined => {
			if (!prev) return undefined;
			return { ...prev, bossing: !prev.bossing };
		});
	};

	return {
		character,
		setCharacter,
		committedName,
		levelInput,
		setLevelInput,
		targetLevelInput,
		setTargetLevelInput,
		nameError,
		handleNameBlur,
		updateCharacter,
		toggleBossing,
	};
};

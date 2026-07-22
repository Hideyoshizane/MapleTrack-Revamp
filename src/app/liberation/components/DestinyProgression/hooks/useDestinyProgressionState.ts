'use client';

import { useEffect, useRef, useState } from 'react';

import type { GetLiberationListCharacterResponseBody } from '@features/liberation/schemas/liberation.response.schema';
import type { Dispatch, SetStateAction } from 'react';

type Props = {
	selectedCharacter: GetLiberationListCharacterResponseBody;
	onCharacterUpdateAction?: (updated: Partial<GetLiberationListCharacterResponseBody>) => void;
};

type ReturnType = {
	selectedQuest: string | null;
	setSelectedQuest: Dispatch<SetStateAction<string | null>>;
	determinationPoints: number;
	setDeterminationPoints: Dispatch<SetStateAction<number>>;
};

export const useDestinyProgressionState = ({ selectedCharacter, onCharacterUpdateAction }: Props): ReturnType => {
	const [selectedQuest, setSelectedQuest] = useState<string | null>(selectedCharacter.currentDestinyQuest);

	const [determinationPoints, setDeterminationPoints] = useState<number>(selectedCharacter.currentDestinyPoints);

	const isBackendSyncRef = useRef<boolean>(false);

	const prevCharacterIdRef = useRef(selectedCharacter.characterId);
	const prevQuestRef = useRef(selectedCharacter.currentDestinyQuest);
	const prevPointsRef = useRef(selectedCharacter.currentDestinyPoints);

	useEffect(() => {
		const characterChanged = prevCharacterIdRef.current !== selectedCharacter.characterId;

		const questChanged = prevQuestRef.current !== selectedCharacter.currentDestinyQuest;

		const pointsChanged = prevPointsRef.current !== selectedCharacter.currentDestinyPoints;

		if (!characterChanged && !questChanged && !pointsChanged) {
			return;
		}

		isBackendSyncRef.current = true;

		if (questChanged) {
			setSelectedQuest(selectedCharacter.currentDestinyQuest);
		}

		if (pointsChanged) {
			setDeterminationPoints(selectedCharacter.currentDestinyPoints);
		}

		prevCharacterIdRef.current = selectedCharacter.characterId;
		prevQuestRef.current = selectedCharacter.currentDestinyQuest;
		prevPointsRef.current = selectedCharacter.currentDestinyPoints;

		setTimeout(() => {
			isBackendSyncRef.current = false;
		}, 100);
	}, [selectedCharacter.characterId, selectedCharacter.currentDestinyQuest, selectedCharacter.currentDestinyPoints]);

	useEffect(() => {
		if (isBackendSyncRef.current || !onCharacterUpdateAction) {
			return;
		}

		const questChanged = selectedQuest !== selectedCharacter.currentDestinyQuest;

		const pointsChanged = determinationPoints !== selectedCharacter.currentDestinyPoints;

		if (!questChanged && !pointsChanged) {
			return;
		}

		onCharacterUpdateAction({
			currentDestinyQuest: selectedQuest ?? undefined,
			currentDestinyPoints: determinationPoints,
		});
	}, [selectedQuest, determinationPoints, selectedCharacter, onCharacterUpdateAction]);

	return { selectedQuest, setSelectedQuest, determinationPoints, setDeterminationPoints };
};

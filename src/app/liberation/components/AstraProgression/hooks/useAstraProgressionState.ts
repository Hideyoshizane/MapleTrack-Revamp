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
	vestigePoints: number;
	setVestigePoints: Dispatch<SetStateAction<number>>;
	tracePoints: number;
	setTracePoints: Dispatch<SetStateAction<number>>;
};

export const useAstraProgressionState = ({ selectedCharacter, onCharacterUpdateAction }: Props): ReturnType => {
	const [selectedQuest, setSelectedQuest] = useState<string | null>(selectedCharacter.currentAstraQuest);

	const [vestigePoints, setVestigePoints] = useState<number>(selectedCharacter.currentAstraVestigesPoints);
	const [tracePoints, setTracePoints] = useState<number>(selectedCharacter.currentAstraTracesPoints);

	const isBackendSyncRef = useRef<boolean>(false);

	const prevCharacterIdRef = useRef(selectedCharacter.characterId);
	const prevQuestRef = useRef(selectedCharacter.currentAstraQuest);
	const prevVestigesRef = useRef(selectedCharacter.currentAstraVestigesPoints);
	const prevTracesRef = useRef(selectedCharacter.currentAstraTracesPoints);

	useEffect(() => {
		const characterChanged = prevCharacterIdRef.current !== selectedCharacter.characterId;
		const questChanged = prevQuestRef.current !== selectedCharacter.currentAstraQuest;
		const vestigesChanged = prevVestigesRef.current !== selectedCharacter.currentAstraVestigesPoints;
		const tracesChanged = prevTracesRef.current !== selectedCharacter.currentAstraTracesPoints;
		if (!characterChanged && !questChanged && !vestigesChanged && !tracesChanged) {
			return;
		}

		isBackendSyncRef.current = true;

		if (questChanged) {
			setSelectedQuest(selectedCharacter.currentAstraQuest);
		}
		if (vestigesChanged) {
			setVestigePoints(selectedCharacter.currentAstraVestigesPoints);
		}
		if (tracesChanged) {
			setTracePoints(selectedCharacter.currentAstraTracesPoints);
		}
		prevCharacterIdRef.current = selectedCharacter.characterId;
		prevQuestRef.current = selectedCharacter.currentAstraQuest;
		prevVestigesRef.current = selectedCharacter.currentAstraVestigesPoints;
		prevTracesRef.current = selectedCharacter.currentAstraTracesPoints;

		setTimeout(() => {
			isBackendSyncRef.current = false;
		}, 100);
	}, [
		selectedCharacter.characterId,
		selectedCharacter.currentAstraQuest,
		selectedCharacter.currentAstraVestigesPoints,
		selectedCharacter.currentAstraTracesPoints,
	]);

	useEffect(() => {
		if (isBackendSyncRef.current || !onCharacterUpdateAction) {
			return;
		}

		const questChanged = selectedQuest !== selectedCharacter.currentDestinyQuest;
		const vestigesChanged = vestigePoints !== selectedCharacter.currentAstraVestigesPoints;
		const tracesChanged = tracePoints !== selectedCharacter.currentAstraTracesPoints;
		if (!questChanged && !vestigesChanged && !tracesChanged) {
			return;
		}

		onCharacterUpdateAction({
			currentAstraQuest: selectedQuest ?? undefined,
			currentAstraVestigesPoints: vestigePoints,
			currentAstraTracesPoints: tracePoints,
		});
	}, [selectedQuest, vestigePoints, tracePoints, selectedCharacter, onCharacterUpdateAction]);

	return { selectedQuest, setSelectedQuest, vestigePoints, setVestigePoints, tracePoints, setTracePoints };
};

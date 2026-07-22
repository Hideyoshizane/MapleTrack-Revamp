'use client';

import { useEffect, useRef, useState } from 'react';

import type { GetLiberationListCharacterResponseBody } from '@features/liberation/schemas/liberation.response.schema';
import type { Dispatch, SetStateAction } from 'react';

type Props = {
	selectedCharacter: GetLiberationListCharacterResponseBody;
	onCharacterUpdateAction?: (updatedCharacter: Partial<GetLiberationListCharacterResponseBody>) => void;
};

type Snapshot = {
	selectedQuest: string;
	tracesPoints: number;
};

export const useGenesisProgressionState = ({
	selectedCharacter,
	onCharacterUpdateAction,
}: Props): {
	selectedQuest: string | null;
	setSelectedQuest: Dispatch<SetStateAction<string | null>>;
	tracesPoints: number;
	setTracesPoints: Dispatch<SetStateAction<number>>;
	genesisPass: boolean;
	setGenesisPass: Dispatch<SetStateAction<boolean>>;
	liberated: boolean;
	setLiberated: Dispatch<SetStateAction<boolean>>;
	handleLiberatedToggle: () => void;
} => {
	const [selectedQuest, setSelectedQuest] = useState<string | null>(selectedCharacter.currentGenesisQuest);
	const [tracesPoints, setTracesPoints] = useState<number>(selectedCharacter.currentGenesisPoints);
	const [genesisPass, setGenesisPass] = useState<boolean>(Boolean(selectedCharacter.genesisPass));
	const [liberated, setLiberated] = useState<boolean>(Boolean(selectedCharacter.liberated));

	const previousProgressRef = useRef<Snapshot | null>(null);
	const isBackendSyncRef = useRef<boolean>(false);

	const prevQuestRef = useRef(selectedCharacter.currentGenesisQuest);
	const prevPointsRef = useRef(selectedCharacter.currentGenesisPoints);
	const prevPassRef = useRef(Boolean(selectedCharacter.genesisPass));
	const prevLiberatedRef = useRef(Boolean(selectedCharacter.liberated));

	useEffect(() => {
		const questChanged = prevQuestRef.current !== selectedCharacter.currentGenesisQuest;
		const pointsChanged = prevPointsRef.current !== selectedCharacter.currentGenesisPoints;
		const passChanged = prevPassRef.current !== Boolean(selectedCharacter.genesisPass);
		const liberatedChanged = prevLiberatedRef.current !== Boolean(selectedCharacter.liberated);

		if (!questChanged && !pointsChanged && !passChanged && !liberatedChanged) {
			return;
		}

		isBackendSyncRef.current = true;

		if (questChanged) {
			setSelectedQuest(selectedCharacter.currentGenesisQuest);
		}
		if (pointsChanged) {
			setTracesPoints(selectedCharacter.currentGenesisPoints);
		}
		if (passChanged) {
			setGenesisPass(Boolean(selectedCharacter.genesisPass));
		}

		if (liberatedChanged) {
			setLiberated(Boolean(selectedCharacter.liberated));
		}

		prevQuestRef.current = selectedCharacter.currentGenesisQuest;
		prevPointsRef.current = selectedCharacter.currentGenesisPoints;
		prevPassRef.current = Boolean(selectedCharacter.genesisPass);
		prevLiberatedRef.current = Boolean(selectedCharacter.liberated);

		setTimeout(() => {
			isBackendSyncRef.current = false;
		}, 100);
	}, [
		selectedCharacter.currentGenesisQuest,
		selectedCharacter.currentGenesisPoints,
		selectedCharacter.genesisPass,
		selectedCharacter.liberated,
	]);

	useEffect(() => {
		if (isBackendSyncRef.current) {
			return;
		}
		if (!onCharacterUpdateAction) {
			return;
		}

		const questChanged = selectedQuest !== selectedCharacter.currentGenesisQuest;
		const pointsChanged = tracesPoints !== selectedCharacter.currentGenesisPoints;
		const passChanged = genesisPass !== Boolean(selectedCharacter.genesisPass);
		const liberatedChanged = liberated !== selectedCharacter.liberated;

		if (!questChanged && !pointsChanged && !passChanged && !liberatedChanged) {
			return;
		}

		onCharacterUpdateAction({
			currentGenesisQuest: selectedQuest ?? undefined,
			currentGenesisPoints: tracesPoints,
			genesisPass,
			liberated,
		});
	}, [selectedQuest, tracesPoints, genesisPass, liberated, selectedCharacter, onCharacterUpdateAction]);

	const handleLiberatedToggle = (): void => {
		setLiberated((prev) => {
			const next = !prev;

			if (next) {
				previousProgressRef.current = { selectedQuest: selectedQuest ?? '', tracesPoints };

				setSelectedQuest('Verus Hilla');
				setTracesPoints(1000);
			} else {
				const previous = previousProgressRef.current;

				setSelectedQuest(previous?.selectedQuest ?? 'Von Leon');
				setTracesPoints(previous?.tracesPoints ?? 0);
			}

			return next;
		});
	};

	return {
		selectedQuest,
		setSelectedQuest,
		tracesPoints,
		setTracesPoints,
		genesisPass,
		setGenesisPass,
		liberated,
		setLiberated,
		handleLiberatedToggle,
	};
};

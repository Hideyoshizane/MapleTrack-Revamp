'use client';

import { useEffect, useRef, useState } from 'react';

import { liberationApi } from '@features/liberation/liberationApi';

import { useLiberationSyncPayload } from './useSyncPayload';

import type { ServerName } from '@data/servers/servers';
import type {
	getLiberationListResponseBody,
	GetLiberationListCharacterResponseBody,
} from '@features/liberation/schemas/liberation.response.schema';

type UseLiberationReturn = {
	loading: boolean;
	error: boolean;
	liberationList: getLiberationListResponseBody | null;
	selectedCharacter: GetLiberationListCharacterResponseBody | null;
	activeTab: string;
	setSelectedCharacter: (character: GetLiberationListCharacterResponseBody) => void;
	handleCharacterUpdate: (updated: Partial<GetLiberationListCharacterResponseBody>) => void;
	handleTabChange: (tab: string) => void;
};

const getTabFromCharacter = (character: GetLiberationListCharacterResponseBody | null): string => {
	if (!character) {
		return 'tab1';
	}

	return character.liberated ? 'tab2' : 'tab1';
};

export const useLiberation = (server: ServerName): UseLiberationReturn => {
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<boolean>(false);

	const [liberationList, setLiberationList] = useState<getLiberationListResponseBody | null>(null);
	const [selectedCharacter, setSelectedCharacterState] = useState<GetLiberationListCharacterResponseBody | null>(null);

	const [activeTab, setActiveTab] = useState<string>('tab1');

	const isManualTabChangeRef = useRef<boolean>(false);

	const sync = useLiberationSyncPayload({
		liberationList,
		onServerSync: (updatedCharacter) => {
			setLiberationList((prev) => {
				if (!prev) {
					return prev;
				}

				return {
					...prev,
					characters: prev.characters.map((char) =>
						char.characterId === updatedCharacter.characterId ? { ...char, ...updatedCharacter } : char,
					),
				};
			});

			setSelectedCharacterState((prev) =>
				prev && prev.characterId === updatedCharacter.characterId ? { ...prev, ...updatedCharacter } : prev,
			);
		},
	});

	useEffect(() => {
		document.body.style.cursor = sync.isSyncing ? 'wait' : 'default';
	}, [sync.isSyncing]);

	useEffect((): void => {
		const fetch = async (): Promise<void> => {
			setLoading(true);
			setError(false);

			try {
				const response = await liberationApi.getLiberationList({ server });
				if (!response.success || !response.data) {
					setError(true);

					return;
				}

				const data = response.data;

				setLiberationList(data);
				setSelectedCharacterState(data.characters[0] || null);
			} catch {
				setError(true);
			} finally {
				setLoading(false);
			}
		};

		void fetch();
	}, [server]);

	useEffect((): void => {
		if (!liberationList || !selectedCharacter) {
			return;
		}

		const fresh = liberationList.characters.find((c) => c.name === selectedCharacter.name);

		if (fresh && fresh !== selectedCharacter) {
			setSelectedCharacterState(fresh);
		}
	}, [liberationList, selectedCharacter]);

	useEffect((): void => {
		if (!selectedCharacter || isManualTabChangeRef.current) {
			return;
		}

		setActiveTab(getTabFromCharacter(selectedCharacter));
	}, [selectedCharacter?.characterId]);

	const setSelectedCharacter = (character: GetLiberationListCharacterResponseBody): void => {
		isManualTabChangeRef.current = true;

		setSelectedCharacterState(character);
		setActiveTab(getTabFromCharacter(character));

		setTimeout(() => {
			isManualTabChangeRef.current = false;
		}, 100);
	};

	const handleCharacterUpdate = (updated: Partial<GetLiberationListCharacterResponseBody>): void => {
		if (!liberationList || !selectedCharacter || isManualTabChangeRef.current) {
			return;
		}

		const current = selectedCharacter;

		const hasRealChange =
			(updated.currentGenesisQuest !== undefined && updated.currentGenesisQuest !== current.currentGenesisQuest) ||
			(updated.currentGenesisPoints !== undefined && updated.currentGenesisPoints !== current.currentGenesisPoints) ||
			(updated.currentDestinyQuest !== undefined && updated.currentDestinyQuest !== current.currentDestinyQuest) ||
			(updated.currentDestinyPoints !== undefined && updated.currentDestinyPoints !== current.currentDestinyPoints) ||
			(updated.genesisPass !== undefined && updated.genesisPass !== current.genesisPass) ||
			(updated.liberated !== undefined && updated.liberated !== current.liberated);

		if (!hasRealChange) {
			return;
		}

		setLiberationList((prev) => {
			if (!prev) {
				return prev;
			}

			return {
				...prev,
				characters: prev.characters.map((char) =>
					char.characterId === current.characterId ? { ...char, ...updated } : char,
				),
			};
		});

		setSelectedCharacterState((prev) => (prev ? { ...prev, ...updated } : prev));

		sync.scheduleSync(current.characterId);
	};

	const handleTabChange = (tab: string): void => {
		isManualTabChangeRef.current = true;
		setActiveTab(tab);

		setTimeout(() => {
			isManualTabChangeRef.current = false;
		}, 100);
	};

	return {
		loading,
		error,
		liberationList,
		selectedCharacter,
		activeTab,
		setSelectedCharacter,
		handleCharacterUpdate,
		handleTabChange,
	};
};

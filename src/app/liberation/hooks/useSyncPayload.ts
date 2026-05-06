'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { liberationApi } from '@features/liberation/liberationApi';

import type {
	getLiberationListResponseBody,
	updateLiberationCharacterResponseBody,
} from '@features/liberation/schemas/liberation.response.schema';

type SerializedCharacter = string;

type useLiberationSyncPayloadParams = {
	liberationList: getLiberationListResponseBody | null;
	onServerSync: (updatedCharacter: updateLiberationCharacterResponseBody) => void;
};

type useLiberationSyncPayloadReturn = {
	isSyncing: boolean;
	scheduleSync: (characterId: string) => void;
};

export const useLiberationSyncPayload = ({
	liberationList,
	onServerSync,
}: useLiberationSyncPayloadParams): useLiberationSyncPayloadReturn => {
	const debounceMs = 1500;

	const [isSyncing, setIsSyncing] = useState<boolean>(false);

	const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const currentCacheRef = useRef<Map<string, SerializedCharacter>>(new Map());
	const hasInitializedRef = useRef<boolean>(false);
	const pendingCharacterIdRef = useRef<string | null>(null);

	const liberationListRef = useRef(liberationList);
	const onServerSyncRef = useRef(onServerSync);

	useEffect(() => {
		liberationListRef.current = liberationList;
	}, [liberationList]);

	useEffect(() => {
		onServerSyncRef.current = onServerSync;
	}, [onServerSync]);

	const serializeCharacter = (character: getLiberationListResponseBody['characters'][number]): SerializedCharacter => {
		return JSON.stringify({
			currentGenesisQuest: character.currentGenesisQuest,
			currentGenesisPoints: character.currentGenesisPoints,
			genesisPass: character.genesisPass,
			liberated: character.liberated,
			currentDestinyQuest: character.currentDestinyQuest,
			currentDestinyPoints: character.currentDestinyPoints,
		});
	};

	const isValidDestinyState = (character: getLiberationListResponseBody['characters'][number]): boolean =>
		!!character && !!character.currentDestinyQuest && character.currentDestinyPoints >= 0;

	// Initialize cache on mount
	useEffect(() => {
		if (!liberationList?.characters || hasInitializedRef.current) {
			return;
		}

		for (const character of liberationList.characters) {
			currentCacheRef.current.set(character.characterId, serializeCharacter(character));
		}

		hasInitializedRef.current = true;
	}, [liberationList]);

	useEffect(() => {
		if (!liberationListRef.current?.characters || hasInitializedRef.current) {
			return;
		}

		for (const character of liberationListRef.current.characters) {
			currentCacheRef.current.set(character.characterId, serializeCharacter(character));
		}
		hasInitializedRef.current = true;
	}, []);

	const scheduleSync = (characterId: string): void => {
		// Clear any existing timeout to reset debounce
		if (debounceTimeoutRef.current) {
			clearTimeout(debounceTimeoutRef.current);
			debounceTimeoutRef.current = null;
		}

		// Track which character we're waiting to sync
		pendingCharacterIdRef.current = characterId;

		debounceTimeoutRef.current = setTimeout(() => {
			const syncCharacter = async (): Promise<void> => {
				const currentLiberationList = liberationListRef.current;
				const currentOnServerSync = onServerSyncRef.current;

				if (!currentLiberationList?.characters) {
					pendingCharacterIdRef.current = null;

					return;
				}
				const latestCharacter = currentLiberationList.characters.find(
					(c) => c.characterId === pendingCharacterIdRef.current,
				);
				if (!latestCharacter) {
					pendingCharacterIdRef.current = null;

					return;
				}

				const cachedSerialized = currentCacheRef.current.get(latestCharacter.characterId);
				const currentSerialized = serializeCharacter(latestCharacter);

				if (cachedSerialized === currentSerialized) {
					pendingCharacterIdRef.current = null;

					return;
				}

				setIsSyncing(true);

				try {
					if (!isValidDestinyState(latestCharacter)) {
						toast.error('Invalid Destiny state blocked from sync');

						return;
					}

					const response = await liberationApi.updateListProgression({
						characterId: latestCharacter.characterId,
						currentGenesisQuest: latestCharacter.currentGenesisQuest,
						currentGenesisPoints: latestCharacter.currentGenesisPoints,
						genesisPass: latestCharacter.genesisPass,
						liberated: latestCharacter.liberated,
						currentDestinyQuest: latestCharacter.currentDestinyQuest,
						currentDestinyPoints: latestCharacter.currentDestinyPoints,
					});

					if (response.success && response.data) {
						const mergedCharacter = { ...latestCharacter, ...response.data };

						currentCacheRef.current.set(latestCharacter.characterId, serializeCharacter(mergedCharacter));

						currentOnServerSync(response.data);

						toast.success(response.message);
					} else {
						toast.error(response.message || 'Update error');
					}
				} catch (error) {
					console.error('Sync failed:', error);
					toast.error('Failed to sync character data');
				} finally {
					setIsSyncing(false);
					pendingCharacterIdRef.current = null;
				}
			};

			void syncCharacter();
		}, debounceMs);
	};

	return { isSyncing, scheduleSync };
};

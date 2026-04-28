'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

import { liberationApi } from '@features/liberation/liberationApi';

import type { updateLiberationCharacterRequestBody } from '@features/liberation/schemas/liberation.request.schema';

export const useGenesisSyncPayload = (params: updateLiberationCharacterRequestBody): void => {
	const debounceMs = 1500;

	const debounceRef = useRef<NodeJS.Timeout | null>(null);
	const lastSentPayloadRef = useRef<string | null>(null);
	const lastCharacterIdRef = useRef<string | null>(null);
	const isHydratingRef = useRef<boolean>(true);
	const activeRequestRef = useRef<string | null>(null);

	useEffect(() => {
		const payloadString = JSON.stringify(params);

		const isCharacterChanged = lastCharacterIdRef.current !== params.characterId;

		if (isCharacterChanged) {
			lastCharacterIdRef.current = params.characterId;
			isHydratingRef.current = true;
			lastSentPayloadRef.current = payloadString;
			return;
		}

		if (isHydratingRef.current) {
			isHydratingRef.current = false;
			lastSentPayloadRef.current = payloadString;
			return;
		}

		if (lastSentPayloadRef.current === payloadString) {
			return;
		}

		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		const requestKey = `${params.characterId}-${Date.now()}`;
		activeRequestRef.current = requestKey;

		debounceRef.current = setTimeout(() => {
			const run = async (): Promise<void> => {
				try {
					if (activeRequestRef.current !== requestKey) {
						return;
					}
					const request = await liberationApi.updateListProgression({
						characterId: params.characterId,
						currentQuest: params.currentQuest,
						type: params.type,
						currentPoints: params.currentPoints,
						genesisPass: params.genesisPass,
						liberated: params.liberated,
					});

					if (request.success) {
						toast.success(request.message);
					}

					lastSentPayloadRef.current = payloadString;
				} catch (error) {
					console.error(error);
				}
			};

			void run();
		}, debounceMs);

		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, [params.characterId, params.currentQuest, params.currentPoints, params.genesisPass, params.liberated, debounceMs]);
};

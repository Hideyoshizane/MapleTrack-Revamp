'use client';
import { isSameDay } from 'date-fns';
import { useEffect, useRef, useState } from 'react';

import { createNormalizedEmptyBossList } from '@data/liberation/liberationBosses';
import { liberationApi } from '@features/liberation/liberationApi';

import { QUEST_TYPE } from '../genesisProgression';

import type { checkedBossResponseBody } from '@features/liberation/schemas/liberation.response.schema';

type Props = {
	characterId: string;
	server: string;
	currentDate: Date;
	selectedDate: Date;
	type: string;
};

type CacheEntry = {
	characterId: string;
	data: checkedBossResponseBody[];
};

export const useCheckedBosses = ({
	characterId,
	server,
	currentDate,
	selectedDate,
	type,
}: Props): checkedBossResponseBody[] => {
	const [checkedBosses, setCheckedBosses] = useState<checkedBossResponseBody[]>([]);

	const cacheRef = useRef<CacheEntry | null>(null);
	const requestRef = useRef<string | null>(null);

	useEffect(() => {
		if (!isSameDay(selectedDate, currentDate)) {
			setCheckedBosses(createNormalizedEmptyBossList(type) ?? []);

			return;
		}

		const cached = cacheRef.current;
		if (cached?.characterId === characterId) {
			setCheckedBosses(cached.data);

			return;
		}

		const requestKey = `${characterId}-${currentDate.valueOf()}`;
		requestRef.current = requestKey;

		const run = async (): Promise<void> => {
			try {
				const response = await liberationApi.getCheckedBossesList({
					server,
					type: QUEST_TYPE,
					characterId,
					requestDate: currentDate,
				});

				if (requestRef.current !== requestKey) {
					return;
				}

				const data = response.data ?? [];

				cacheRef.current = { characterId, data };
				setCheckedBosses(data);
			} catch (error) {
				console.error(error);
			}
		};

		void run();
	}, [characterId, server, currentDate, selectedDate, type]);

	return checkedBosses;
};

'use client';

import { useEffect, useRef, useState, useTransition } from 'react';

import { characterApi } from '@features/character/characterApi';

import { useDebouncedValue } from './useDebouncedValue';

import type { searchCharacterResponseBody } from '@features/character/schemas/character.response.schema';

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 300;

type UseCharacterSearchReturn = {
	query: string;
	setQuery: (value: string) => void;
	results: searchCharacterResponseBody['characters'];
	isLoading: boolean;
	hasSearched: boolean;
};

export const useCharacterSearch = (): UseCharacterSearchReturn => {
	const [query, setQuery] = useState<string>('');
	const [results, setResults] = useState<searchCharacterResponseBody['characters']>([]);
	const [isPending, startTransition] = useTransition();

	const requestIdRef = useRef<number>(0);

	const debouncedQuery = useDebouncedValue<string>(query, DEBOUNCE_MS);

	useEffect((): void => {
		if (debouncedQuery.length < MIN_QUERY_LENGTH) {
			setResults([]);

			return;
		}

		const currentRequestId = ++requestIdRef.current;

		startTransition((): void => {
			void (async (): Promise<void> => {
				try {
					const response = await characterApi.searchCharacter({ parameters: debouncedQuery });

					if (requestIdRef.current !== currentRequestId) {
						return;
					}

					setResults(response.success ? (response.data?.characters ?? []) : []);
				} catch {
					if (requestIdRef.current === currentRequestId) {
						setResults([]);
					}
				}
			})();
		});
	}, [debouncedQuery]);

	return { query, setQuery, results, isLoading: isPending, hasSearched: debouncedQuery.length >= MIN_QUERY_LENGTH };
};

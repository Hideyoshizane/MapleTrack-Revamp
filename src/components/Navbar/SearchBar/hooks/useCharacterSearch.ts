'use client';

import { useEffect, useRef, useState, useTransition } from 'react';

import { characterApi } from '@features/character/characterApi';

import { useDebouncedValue } from './useDebouncedValue';

import type { searchCharacterResponseBody } from '@features/character/schemas/character.response.schema';

type UseCharacterSearchReturn = {
	query: string;
	setQuery: (value: string) => void;
	results: searchCharacterResponseBody['characters'];
	isLoading: boolean;
	hasSearched: boolean;
};

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 300;

export const useCharacterSearch = (): UseCharacterSearchReturn => {
	const [query, setQuery] = useState<string>('');
	const [results, setResults] = useState<searchCharacterResponseBody['characters']>([]);
	const [isPending, startTransition] = useTransition();

	const requestIdRef = useRef<number>(0);

	const debouncedQuery = useDebouncedValue<string>(query, DEBOUNCE_MS);

	useEffect((): void => {
		if (debouncedQuery.length < MIN_QUERY_LENGTH) {
			requestIdRef.current++;
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

	const hasSearched = debouncedQuery.length >= MIN_QUERY_LENGTH;

	return {
		query,
		setQuery,
		results: hasSearched ? results : [],
		isLoading: isPending,
		hasSearched: debouncedQuery.length >= MIN_QUERY_LENGTH,
	};
};

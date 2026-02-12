'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { characterQueryKeys } from '@features/character/character.queryKeys';
import { characterApi } from '@features/character/characterApi';

import type { CharacterDraft as Character } from '@features/character/characterModel';
import type { UseQueryResult } from '@tanstack/react-query';

type Params = {
	userOrigin: string;
	server: string;
	code: string;
};

export const useCharacterQuery = ({ userOrigin, server, code }: Params): UseQueryResult<Character, Error> => {
	const query = useQuery<Character>({
		queryKey: characterQueryKeys.detail(userOrigin, server, code),

		queryFn: async (): Promise<Character> => {
			const res = await characterApi.getCharacterData({ server, code });

			if (!res.success || !res.data) {
				throw new Error(res.message ?? 'Failed to fetch character');
			}

			return res.data;
		},

		staleTime: 0,
		refetchOnMount: false,
		refetchOnWindowFocus: true,
	});

	useEffect(() => {
		void query.refetch();
	}, [userOrigin, server, code, query]);

	return query;
};

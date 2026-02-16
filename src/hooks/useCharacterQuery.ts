'use client';

import { useQuery } from '@tanstack/react-query';

import { characterQueryKeys } from '@features/character/character.queryKeys';
import { characterApi } from '@features/character/characterApi';

import type { CharacterDraft as Character } from '@features/character/characterModel';
import type { UseQueryResult } from '@tanstack/react-query';

type Params = {
	server: string;
	code: string;
};

export const useCharacterQuery = ({ server, code }: Params): UseQueryResult<Character, Error> => {
	return useQuery<Character>({
		queryKey: characterQueryKeys.detail(server, code),
		queryFn: async (): Promise<Character> => {
			const res = await characterApi.getCharacterData({ server, code });

			if (!res.success || !res.data) {
				throw new Error(res.message ?? 'Failed to fetch character');
			}

			return res.data;
		},
		staleTime: 0,
		refetchOnWindowFocus: false,
		retry: 1,
	});
};

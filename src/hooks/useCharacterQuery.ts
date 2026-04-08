'use client';

import { useQuery } from '@tanstack/react-query';

import { characterQueryKeys } from '@features/character/character.queryKeys';
import { characterApi } from '@features/character/characterApi';

import type { getCharacterDataResponseBody } from '@features/character/schemas/character.response.schema';
import type { UseQueryResult } from '@tanstack/react-query';

type Params = {
	server: string;
	className: string;
};

export const useCharacterQuery = ({
	server,
	className,
}: Params): UseQueryResult<getCharacterDataResponseBody, Error> => {
	return useQuery<getCharacterDataResponseBody>({
		queryKey: characterQueryKeys.detail(server, className),
		queryFn: async (): Promise<getCharacterDataResponseBody> => {
			const res = await characterApi.getCharacterData({ server, className });

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

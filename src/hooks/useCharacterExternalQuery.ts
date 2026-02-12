import { useQuery } from '@tanstack/react-query';

import { characterQueryKeys } from '@features/character/character.queryKeys';
import { characterApi } from '@features/character/characterApi';

import type { CharacterDataFromAPI } from '@features/character/characterApi';
import type { UseQueryResult } from '@tanstack/react-query';

type Params = {
	name?: string;
	server: string;
	enabled: boolean;
};

export const useCharacterExternalQuery = ({
	name,
	server,
	enabled,
}: Params): UseQueryResult<CharacterDataFromAPI, Error> => {
	return useQuery<CharacterDataFromAPI>({
		queryKey: characterQueryKeys.external(name ?? '', server),
		queryFn: async () => {
			if (!name) {
				throw new Error('Character name missing');
			}

			const res = await characterApi.getCharacterDataFromAPI(name, server);

			if (!res.success || !res.data) {
				throw new Error('Failed to fetch external data');
			}

			return res.data;
		},
		enabled: enabled && Boolean(name),
		refetchOnMount: 'always',
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
		staleTime: 0,
	});
};

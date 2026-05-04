import { useQuery } from '@tanstack/react-query';

import { characterQueryKeys } from '@features/character/character.queryKeys';
import { characterApi } from '@features/character/characterApi';

import type { getCharacterDataFromAPIResponseBody } from '@features/character/schemas/character.response.schema';
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
}: Params): UseQueryResult<getCharacterDataFromAPIResponseBody, Error> => {
	return useQuery<getCharacterDataFromAPIResponseBody>({
		queryKey: characterQueryKeys.external(server, name ?? ''),
		queryFn: async () => {
			if (!name) {
				throw new Error('Character name missing');
			}

			const payload = { characterName: name, server };
			const res = await characterApi.getCharacterDataFromAPI(payload);
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

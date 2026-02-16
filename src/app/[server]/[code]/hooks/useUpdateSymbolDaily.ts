import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type UseMutationResult } from '@tanstack/react-query';

import { characterQueryKeys } from '@features/character/character.queryKeys';
import { characterApi } from '@features/character/characterApi';

type Payload = {
	symbolName: string;
	server: string;
	code: string;
	bonus: number;
};

type UpdateSymbolDailyResponse = Awaited<ReturnType<typeof characterApi.updateCharacterDaily>>;

export const useUpdateSymbolDaily = (): UseMutationResult<UpdateSymbolDailyResponse, Error, Payload, unknown> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: Payload) => characterApi.updateCharacterDaily(payload),

		onSuccess: (_data, variables): void => {
			void queryClient.invalidateQueries({
				queryKey: characterQueryKeys.detail(variables.server, variables.code),
			});
		},
	});
};

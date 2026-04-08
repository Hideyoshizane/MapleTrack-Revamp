import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type UseMutationResult } from '@tanstack/react-query';

import { characterQueryKeys } from '@features/character/character.queryKeys';
import { characterApi } from '@features/character/characterApi';

import type { updateCharacterDailyRequestBody } from '@features/character/schemas/character.request.schema';

type UpdateSymbolDailyResponse = Awaited<ReturnType<typeof characterApi.updateCharacterDaily>>;

export const useUpdateSymbolDaily = (): UseMutationResult<
	UpdateSymbolDailyResponse,
	Error,
	updateCharacterDailyRequestBody,
	unknown
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: updateCharacterDailyRequestBody) => characterApi.updateCharacterDaily(payload),

		onSuccess: (_data, variables): void => {
			void queryClient.invalidateQueries({
				queryKey: characterQueryKeys.detail(variables.server, variables.className),
			});
		},
	});
};

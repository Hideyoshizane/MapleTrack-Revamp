import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type UseMutationResult } from '@tanstack/react-query';

import { characterQueryKeys } from '@features/character/character.queryKeys';
import { characterApi } from '@features/character/characterApi';

import type { updateCharacterWeeklyRequestBody } from '@features/character/schemas/character.request.schema';

type UpdateSymbolWeeklyResponse = Awaited<ReturnType<typeof characterApi.updateCharacterWeekly>>;

export const useUpdateSymbolWeekly = (): UseMutationResult<
	UpdateSymbolWeeklyResponse,
	Error,
	updateCharacterWeeklyRequestBody,
	unknown
> => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: updateCharacterWeeklyRequestBody) => characterApi.updateCharacterWeekly(payload),

		onSuccess: (_data, variables): void => {
			void queryClient.invalidateQueries({
				queryKey: characterQueryKeys.detail(variables.server, variables.className),
			});
		},
	});
};

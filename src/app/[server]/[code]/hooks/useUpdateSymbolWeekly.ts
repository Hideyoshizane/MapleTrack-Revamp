import { useMutation, useQueryClient } from '@tanstack/react-query';

import { characterQueryKeys } from '@features/character/character.queryKeys';
import { characterApi } from '@features/character/characterApi';

import type { updateCharacterWeeklyRequestBody } from '@features/character/schemas/character.request.schema';
import type { UseMutationResult } from '@tanstack/react-query';

type UpdateSymbolWeeklyResponse = Awaited<ReturnType<typeof characterApi.updateCharacterWeekly>>;

export const useUpdateSymbolWeekly = (): UseMutationResult<
	UpdateSymbolWeeklyResponse,
	Error,
	updateCharacterWeeklyRequestBody
> => {
	const queryClient = useQueryClient();

	return useMutation<UpdateSymbolWeeklyResponse, Error, updateCharacterWeeklyRequestBody>({
		mutationFn: async (payload): Promise<UpdateSymbolWeeklyResponse> => {
			return await characterApi.updateCharacterWeekly(payload);
		},
		onSuccess: async (_data, variables): Promise<void> => {
			await queryClient.invalidateQueries({
				queryKey: characterQueryKeys.detail(variables.server, variables.className),
			});
		},
	});
};

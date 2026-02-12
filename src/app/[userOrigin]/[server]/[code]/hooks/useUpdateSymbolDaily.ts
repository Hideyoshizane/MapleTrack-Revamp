import { useMutation, useQueryClient } from '@tanstack/react-query';

import { characterQueryKeys } from '@features/character/character.queryKeys';
import { characterApi } from '@features/character/characterApi';

type Payload = {
	symbolName: string;
	userOrigin: string;
	server: string;
	code: string;
	bonus: number;
};

export const useUpdateSymbolDaily = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: Payload) => characterApi.updateCharacterDaily(payload),

		onSuccess: (_data, variables): void => {
			void queryClient.invalidateQueries({
				queryKey: characterQueryKeys.detail(variables.userOrigin, variables.server, variables.code),
			});
		},
	});
};

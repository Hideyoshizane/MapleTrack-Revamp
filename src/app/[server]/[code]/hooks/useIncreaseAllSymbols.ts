import { useMutation } from '@tanstack/react-query';

import { characterApi } from '@features/character/characterApi';

import type { updateCharacterAllDailyRequestBody } from '@features/character/schemas/character.request.schema';
import type { updateCharacterAllDailyResponseBody } from '@features/character/schemas/character.response.schema';
import type { UseMutationResult } from '@tanstack/react-query';

export const useIncreaseAllSymbols = ({
	server,
	className,
	id,
	arcaneBonus,
	sacredBonus,
}: updateCharacterAllDailyRequestBody): UseMutationResult<updateCharacterAllDailyResponseBody, Error, void> => {
	return useMutation<updateCharacterAllDailyResponseBody, Error, void>({
		mutationFn: async (): Promise<updateCharacterAllDailyResponseBody> => {
			const response = await characterApi.updateAllDaily({ server, className, id, arcaneBonus, sacredBonus });
			if (!response.data) {
				throw new Error(response.message);
			}
			return response.data;
		},
	});
};

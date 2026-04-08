import { useMutation } from '@tanstack/react-query';

import { characterApi } from '@features/character/characterApi';

import type { LevelUpResult } from '@data/symbols/symbolMappings';
import type { updateCharacterAllDailyRequestBody } from '@features/character/schemas/character.request.schema';
import type { UseMutationResult } from '@tanstack/react-query';

export const useIncreaseAllSymbols = ({
	server,
	className,
	id,
	arcaneBonus,
	sacredBonus,
}: updateCharacterAllDailyRequestBody): UseMutationResult<Record<string, LevelUpResult>, Error, void> => {
	return useMutation<Record<string, LevelUpResult>, Error, void>({
		mutationFn: async (): Promise<Record<string, LevelUpResult>> => {
			return await characterApi.updateAllDaily({ server, className, id, arcaneBonus, sacredBonus });
		},
	});
};

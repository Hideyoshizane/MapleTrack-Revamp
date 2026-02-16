import { useMutation } from '@tanstack/react-query';

import { characterApi } from '@features/character/characterApi';

import type { LevelUpResult } from '@data/symbols/symbolMappings';
import type { UseMutationResult } from '@tanstack/react-query';

type UseIncreaseAllSymbolsParams = {
	userOrigin: string;
	server: string;
	code: string;
	arcaneBonus: number;
	sacredBonus: number;
};

export const useIncreaseAllSymbols = ({
	server,
	code,
	arcaneBonus,
	sacredBonus,
}: UseIncreaseAllSymbolsParams): UseMutationResult<Record<string, LevelUpResult>, Error, void> => {
	return useMutation<Record<string, LevelUpResult>, Error, void>({
		mutationFn: async (): Promise<Record<string, LevelUpResult>> => {
			return await characterApi.updateAllDaily({
				server,
				code,
				arcaneBonus,
				sacredBonus,
			});
		},
	});
};

import { useMutation } from '@tanstack/react-query';

import { characterApi } from '@features/character/characterApi';

import type { LevelUpResult } from '@data/symbols/symbolMappings';

type UseIncreaseAllSymbolsParams = {
	userOrigin: string;
	server: string;
	code: string;
	arcaneBonus: number;
	sacredBonus: number;
};

export const useIncreaseAllSymbols = ({ server, code, arcaneBonus, sacredBonus }: UseIncreaseAllSymbolsParams) => {
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

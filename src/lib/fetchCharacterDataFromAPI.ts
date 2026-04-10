import { isRebootServer, getRegion, getServerByName } from '@data/servers/servers';
import axiosInstance from '@lib/axios/axios';

import type { getCharacterDataFromAPIResponseBody } from '@features/character/schemas/character.response.schema';
import type { AxiosError } from 'axios';

type NexonRankingResponse = {
	ranks: getCharacterDataFromAPIResponseBody[];
};

export const fetchCharacterDataFromApi = async (
	characterName: string,
	server: string,
): Promise<getCharacterDataFromAPIResponseBody> => {
	const serverObj = getServerByName(server);
	if (!serverObj) {
		throw new Error('Server not found');
	}

	// Determine reboot index based on server type
	const rebootIndex = isRebootServer(server) ? 1 : 0;
	const serverLocation = getRegion(serverObj);

	try {
		const { data } = await axiosInstance.get<NexonRankingResponse>(
			`https://www.nexon.com/api/maplestory/no-auth/ranking/v2/${serverLocation}`,
			{
				params: {
					type: 'overall',
					id: 'weekly',
					reboot_index: rebootIndex,
					page_index: 41,
					character_name: characterName,
				},

				headers: { 'Cache-Control': 'no-store' },
			},
		);

		// Extract first ranked character
		const character = data.ranks?.[0];

		if (!character) {
			throw new Error('Character not found');
		}

		return { characterImgURL: character.characterImgURL, level: character.level };
	} catch (error) {
		if ((error as AxiosError).isAxiosError) {
			const axiosError = error as AxiosError;

			console.error('Nexon API request failed', { status: axiosError.response?.status, url: axiosError.config?.url });
			throw new Error(`External API failed: ${axiosError.response?.status ?? 'unknown'}`);
		}

		throw error;
	}
};

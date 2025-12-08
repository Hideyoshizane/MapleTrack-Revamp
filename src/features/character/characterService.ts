import axiosInstance from '@lib/axios/axios';
import { templateCharacter } from '@lib/template/characterTemplate';

import type { CharacterDocument } from './characterModel';
import type { ApiResponse } from '@sharedTypes/api';
import type {
	Character,
	GetAllCharactersRequestBody,
	GetCharacterDataRequestBody,
	UpdateCharacterRequestBody,
	CharacterDataFromAPI,
} from '@sharedTypes/character';

type GenerateCharacterOptions = {
	jobClassName: string;
	jobType: string;
	legion: string;
	code: string;
	linkSkill: string;
	server: string;
	userOrigin: string;
	lastUpdate?: Date;
};

export const generateCharacterObject = ({
	jobClassName,
	jobType,
	legion,
	linkSkill,
	server,
	userOrigin,
	code,
	lastUpdate,
}: GenerateCharacterOptions): Partial<CharacterDocument> => {
	// Deep clone template to avoid mutating the original
	const clonedTemplate = structuredClone(templateCharacter);

	return {
		...clonedTemplate,
		class: jobClassName,
		code,
		jobType,
		legion,
		linkSkill,
		server,
		userOrigin,
		lastUpdate,
	};
};

export const characterApi = {
	getAllCharacters: async (payload: GetAllCharactersRequestBody): Promise<ApiResponse<Character[]>> => {
		const { data } = await axiosInstance.post<ApiResponse<Character[]>>('/characters/getAllCharacters', payload);
		return data;
	},

	getCharacterData: async (payload: GetCharacterDataRequestBody): Promise<ApiResponse<Character>> => {
		const { data } = await axiosInstance.post<ApiResponse<Character>>('/characters/getCharacterData', payload);
		return data;
	},

	getCharacterDataFromAPI: async (
		characterName: string,
		server: string
	): Promise<ApiResponse<CharacterDataFromAPI>> => {
		const { data } = await axiosInstance.get<ApiResponse<CharacterDataFromAPI>>('/characters/getCharacterDataFromAPI', {
			params: { character_name: characterName, server },
		});
		return data;
	},

	updateCharacterData: async (payload: UpdateCharacterRequestBody): Promise<ApiResponse> => {
		const { data } = await axiosInstance.patch<ApiResponse>('/characters/updateCharacter', payload);
		return data;
	},

	updateAllDaily: async (payload: {
		userOrigin: string;
		server: string;
		code: string;
		arcaneBonus: number;
		sacredBonus: number;
	}): Promise<Record<string, any>> => {
		const { data } = await axiosInstance.post<{
			success: boolean;
			message: string;
			data: Record<string, any>;
		}>('/api/characters/updateAllDaily', payload);

		if (!data.success) throw new Error(data.message ?? 'Failed to update all daily symbols');
		return data.data;
	},
};

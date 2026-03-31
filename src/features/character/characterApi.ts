import axiosInstance from '@lib/axios/axios';

import type { CharacterDraft as Character } from './characterModel';
import type { LevelUpResult } from '@data/symbols/symbolMappings';
import type { ApiRequest, ApiResponse } from '@sharedTypes/api';

export type GetAllCharactersRequestBody = ApiRequest<{
	server: string;
}>;

export type GetCharacterDataRequestBody = ApiRequest<{
	server: string;
	code: string;
}>;

export type UpdateCharacterRequestBody = ApiRequest<{
	userOrigin: string;
	server: string;
	code: string;
	data: Character;
}>;

export type CharacterDataFromAPI = {
	level: number;
	characterImgURL: string;
};

type UpdateCharacterResponseData = {
	currentExp: number;
	currentLevel: number;
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
		server: string,
	): Promise<ApiResponse<CharacterDataFromAPI>> => {
		const payload = { characterName, server };

		const { data } = await axiosInstance.post<ApiResponse<CharacterDataFromAPI>>(
			'/characters/getCharacterDataFromAPI',
			payload,
		);

		return data;
	},

	updateCharacterData: async (payload: UpdateCharacterRequestBody): Promise<ApiResponse> => {
		const { data } = await axiosInstance.patch<ApiResponse>('/characters/updateCharacter', payload);

		return data;
	},

	updateAllDaily: async (payload: {
		server: string;
		code: string;
		arcaneBonus: number;
		sacredBonus: number;
	}): Promise<Record<string, LevelUpResult>> => {
		const { data } = await axiosInstance.post<{
			success: boolean;
			message: string;
			data: Record<string, LevelUpResult>;
		}>('/characters/updateAllDaily', payload);

		if (!data.success) {
			throw new Error(data.message ?? 'Failed to update all daily symbols');
		}

		return data.data;
	},

	updateCharacterDaily: async (payload: {
		symbolName: string;
		bonus: number;
		server: string;
		code: string;
	}): Promise<ApiResponse<UpdateCharacterResponseData>> => {
		const { data } = await axiosInstance.post<ApiResponse<UpdateCharacterResponseData>>(
			'/characters/updateCharacterDaily',
			payload,
		);

		return data;
	},

	updateCharacterWeekly: async (payload: {
		symbolName: string;
		server: string;
		code: string;
	}): Promise<ApiResponse<UpdateCharacterResponseData>> => {
		const { data } = await axiosInstance.post<ApiResponse<UpdateCharacterResponseData>>(
			'/characters/updateCharacterWeekly',
			payload,
		);

		return data;
	},
};

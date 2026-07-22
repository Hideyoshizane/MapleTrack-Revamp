import { requestApi } from '@lib/axios/apiClient';

import type {
	GetAllCharactersRequestBody,
	getCharacterDataRequestBody,
	updateCharacterRequestBody,
	updateCharacterDailyRequestBody,
	updateCharacterAllDailyRequestBody,
	updateCharacterWeeklyRequestBody,
	getCharacterDataFromAPIRequestBody,
	searchCharacterRequestBody,
} from './schemas/character.request.schema';
import type {
	getAllCharactersResponseBody,
	getCharacterDataResponseBody,
	getEditCharacterDataResponseBody,
	updateCharacterDailyResponseBody,
	updateCharacterWeeklyResponseBody,
	getCharacterDataFromAPIResponseBody,
	searchCharacterResponseBody,
	updateCharacterAllDailyResponseBody,
} from './schemas/character.response.schema';
import type { ApiResponse } from '@sharedTypes/api';

export const characterApi = {
	getAllCharacters: async (
		payload: GetAllCharactersRequestBody,
	): Promise<ApiResponse<getAllCharactersResponseBody[]>> =>
		requestApi('/characters/getAllCharacters', 'POST', payload),

	getCharacterData: async (
		payload: getCharacterDataRequestBody,
	): Promise<ApiResponse<getCharacterDataResponseBody>> =>
		requestApi('/characters/getCharacterData', 'POST', payload),

	getEditCharacterData: async (
		payload: getCharacterDataRequestBody,
	): Promise<ApiResponse<getEditCharacterDataResponseBody>> =>
		requestApi('/characters/getEditCharacterData', 'POST', payload),

	getCharacterDataFromAPI: async (
		payload: getCharacterDataFromAPIRequestBody,
	): Promise<ApiResponse<getCharacterDataFromAPIResponseBody>> =>
		requestApi('/characters/getCharacterDataFromAPI', 'POST', payload),

	updateCharacterData: async (payload: updateCharacterRequestBody): Promise<ApiResponse> =>
		requestApi('/characters/updateCharacter', 'PATCH', payload),

	updateAllDaily: async (
		payload: updateCharacterAllDailyRequestBody,
	): Promise<ApiResponse<updateCharacterAllDailyResponseBody>> =>
		requestApi('/characters/updateAllDaily', 'POST', payload),

	updateCharacterDaily: async (
		payload: updateCharacterDailyRequestBody,
	): Promise<ApiResponse<updateCharacterDailyResponseBody>> =>
		requestApi('/characters/updateCharacterDaily', 'POST', payload),

	updateCharacterWeekly: async (
		payload: updateCharacterWeeklyRequestBody,
	): Promise<ApiResponse<updateCharacterWeeklyResponseBody>> =>
		requestApi('/characters/updateCharacterWeekly', 'POST', payload),

	searchCharacter: async (params: searchCharacterRequestBody): Promise<ApiResponse<searchCharacterResponseBody>> =>
		requestApi<ApiResponse<searchCharacterResponseBody>, searchCharacterRequestBody>(
			'/characters/searchCharacter',
			'GET',
			params,
		),
};

import { requestApi } from '@lib/axios/apiClient';

import type {
	getLiberationListRequestBody,
	getCheckedBossesListRequesBody,
	updateLiberationCharacterRequestBody,
} from './schemas/liberation.request.schema';
import type {
	getLiberationListResponseBody,
	getCheckedBossesListResponseBody,
	updateLiberationCharacterResponseBody,
} from './schemas/liberation.response.schema';
import type { ApiResponse } from '@sharedTypes/api';

export const liberationApi = {
	getLiberationList: async (
		payload: getLiberationListRequestBody,
	): Promise<ApiResponse<getLiberationListResponseBody>> =>
		requestApi('/liberation/getLiberationList', 'POST', payload),

	getCheckedBossesList: async (
		payload: getCheckedBossesListRequesBody,
	): Promise<ApiResponse<getCheckedBossesListResponseBody>> =>
		requestApi('/liberation/getCheckedBossesList', 'POST', payload),
	updateListProgression: async (
		payload: updateLiberationCharacterRequestBody,
	): Promise<ApiResponse<updateLiberationCharacterResponseBody>> =>
		requestApi('/liberation/updateListProgression', 'POST', payload),
};

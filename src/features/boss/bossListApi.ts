import { requestApi } from '@lib/axios/apiClient';

import type {
	getBossListRequestBody,
	getEditBossListRequestBody,
	updateBossListRequestBody,
	toggleBossListRequestBody,
} from './schemas/bossList.request.schema';
import type {
	getBossListResponseBody,
	getEditBossListResponseBody,
	toggleBossListResponseBody,
} from './schemas/bossList.response.schema';
import type { ApiResponse } from '@sharedTypes/api';

export const bossListApi = {
	getBossList: async (payload: getBossListRequestBody): Promise<ApiResponse<getBossListResponseBody>> =>
		requestApi('/bossList/getBossList', 'POST', payload),

	getEditBossList: async (payload: getEditBossListRequestBody): Promise<ApiResponse<getEditBossListResponseBody>> =>
		requestApi('/bossList/getEditBossList', 'POST', payload),

	updateBossList: async (payload: updateBossListRequestBody): Promise<ApiResponse> =>
		requestApi('/bossList/updateBossList', 'POST', payload),

	toggleBoss: async (payload: toggleBossListRequestBody): Promise<ApiResponse<toggleBossListResponseBody>> =>
		requestApi('/bossList/toggleBoss', 'POST', payload),
};

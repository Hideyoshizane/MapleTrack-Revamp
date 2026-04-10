import { requestApi } from '@lib/axios/apiClient';
import axiosInstance from '@lib/axios/axios';

import type {
	getBossListRequestBody,
	getEditBossListRequestBody,
	updateBossListRequestBody,
} from './schemas/bossList.request.schema';
import type { getBossListResponseBody, getEditBossListResponseBody } from './schemas/bossList.response.schema';
import type { ApiResponse } from '@sharedTypes/api';

export type toggleBossRequestBody = {
	server: string;
	characterCode: string;
	bossName: string;
	difficulty: string;
};

export type toggleBossApiResponse = ApiResponse<toggleBossResponse>;

export type toggleBossResponse = {
	weeklyBosses: number;
	totalGains: number;

	characterCode: string;
	bossName: string;
	difficulty: string;

	clearedUpdate: boolean;
};

export const bossListApi = {
	getBossList: async (payload: getBossListRequestBody): Promise<ApiResponse<getBossListResponseBody>> =>
		requestApi('/bossList/getBossList', 'POST', payload),

	getEditBossList: async (payload: getEditBossListRequestBody): Promise<ApiResponse<getEditBossListResponseBody>> =>
		requestApi('/bossList/getEditBossList', 'POST', payload),

	updateBossList: async (payload: updateBossListRequestBody): Promise<ApiResponse> =>
		requestApi('/bossList/updateBossList', 'POST', payload),

	toggleBoss: async (payload: toggleBossRequestBody): Promise<toggleBossApiResponse> => {
		const { data } = await axiosInstance.post<ApiResponse<toggleBossResponse>>('/bossList/toggleBoss', payload);

		return data;
	},
};

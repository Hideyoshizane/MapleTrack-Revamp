import axiosInstance from '@lib/axios/axios';

import type { ZodBossServer } from './bossListSchema';
import type { BossServerDraft as BossServer } from '@features/Boss/bossListModel';
import type { ApiResponse } from '@sharedTypes/api';

export type GetBossListApiResponse = ApiResponse<BossServer>;

export type GetBossListRequestBody = {
	userOrigin: string;
	server: string;
};

export type updateBossListRequestBody = {
	data: ZodBossServer;
};

export type GetBossListResponse = BossServer;

export const bossListApi = {
	getBossList: async (payload: GetBossListRequestBody): Promise<GetBossListApiResponse> => {
		const { data } = await axiosInstance.post<ApiResponse<GetBossListResponse>>('/bossList/getBossList', payload);

		return data;
	},
	updateBossList: async (payload: updateBossListRequestBody): Promise<GetBossListApiResponse> => {
		const { data } = await axiosInstance.post<ApiResponse<GetBossListResponse>>('/bossList/updateBossList', payload);

		return data;
	},
};

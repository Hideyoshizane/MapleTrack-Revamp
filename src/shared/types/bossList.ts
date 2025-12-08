import type { ApiResponse } from './api';
import type { BossListDocument, BossServer } from '@features/Boss/bossListModel';

// Request payload for fetching the BossList
export type GetBossListRequestBody = {
	userOrigin: string;
	server: string;
};

// BossList type excluding Mongoose Document properties
export type BossList = Omit<BossListDocument, keyof Document>;

// API response types
export type GetBossListApiResponse = ApiResponse<BossServer>;

export type UpdateBossListApiResponse = ApiResponse;

export type PopulatedBossList = Omit<BossListDocument, keyof Document>;

export type PostBossListApiResponse = ApiResponse<BossServer>;

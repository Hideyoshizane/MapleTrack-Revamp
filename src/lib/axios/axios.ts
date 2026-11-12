import axios from 'axios';

import type { AxiosInstance } from 'axios';

type ApiErrorResponse = unknown;

const axiosInstance: AxiosInstance = axios.create({
	baseURL: '/api',
	withCredentials: true,
	headers: { 'Content-Type': 'application/json' },
	timeout: 10000,
});

axiosInstance.interceptors.response.use(
	(response) => response,
	(error: unknown): never => {
		if (!axios.isAxiosError<ApiErrorResponse>(error)) {
			console.error('[Axios] Unknown error', error);
			throw error;
		}

		const { method, url } = error.config ?? {};

		if (error.code === 'ECONNABORTED') {
			console.error('[Axios] Request timeout', { method, url });
			throw error;
		}

		if (!error.response) {
			console.error('[Axios] Network error', { method, url, message: error.message });
			throw error;
		}

		console.error('[Axios] API error', { method, url, status: error.response.status, data: error.response.data });

		throw error;
	},
);

export default axiosInstance;

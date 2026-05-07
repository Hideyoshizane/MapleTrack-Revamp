import axios from 'axios';

import type { AxiosInstance } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
	baseURL: '/api',
	withCredentials: true,
	headers: { 'Content-Type': 'application/json' },
	timeout: 10000,
});

axiosInstance.interceptors.response.use(
	(response) => response,
	(error: unknown): never => {
		if (axios.isAxiosError(error)) {
			if (error.code === 'ECONNABORTED') {
				console.error('[Axios] Request timeout', { method: error.config?.method, url: error.config?.url });
			} else if (!error.response) {
				console.error('[Axios] Network error', {
					method: error.config?.method,
					url: error.config?.url,
					message: error.message,
				});
			} else {
				console.error('[Axios] API error', {
					method: error.config?.method,
					url: error.config?.url,
					status: error.response.status,
					data: error.response.data,
				});
			}
		} else {
			console.error('[Axios] Unknown error', error);
		}

		throw error;
	},
);

export default axiosInstance;

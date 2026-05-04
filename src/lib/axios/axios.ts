import axios from 'axios';

import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Tracks AbortController per request
const abortControllerMap: WeakMap<InternalAxiosRequestConfig, AbortController> = new WeakMap();

const baseURL: string = process.env.NEXT_PUBLIC_API_BASE_URL
	? `${process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, '')}/api`
	: 'http://localhost:3000/api';

const axiosInstance: AxiosInstance = axios.create({
	baseURL,
	withCredentials: true,
	headers: { 'Content-Type': 'application/json' },
	timeout: 10000, // 10 seconds
});

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
	const controller: AbortController = new AbortController();

	abortControllerMap.set(config, controller);
	config.signal = controller.signal;

	return config;
});

// Cleans up AbortController
// Rethrows Axios errors
axiosInstance.interceptors.response.use(
	(response: AxiosResponse): AxiosResponse => {
		const controller = abortControllerMap.get(response.config);

		controller?.abort();
		abortControllerMap.delete(response.config);

		return response;
	},
	(error: unknown): never => {
		if (axios.isAxiosError(error)) {
			const config = error.config;
			const controller = config ? abortControllerMap.get(config) : undefined;

			controller?.abort();

			if (config) {
				abortControllerMap.delete(config);
			}

			// Optional logging
			if (error.code === 'ECONNABORTED') {
				console.error('Axios request timed out', { url: error.config?.url, method: error.config?.method });
			}

			throw error;
		}

		throw new Error('Unknown Axios error');
	},
);

export default axiosInstance;

import axiosInstance from './axios';

import type { AxiosRequestConfig } from 'axios';

export const requestApi = async <T>(
	url: string,
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
	payload?: unknown,
	config?: AxiosRequestConfig,
): Promise<T> => {
	const axiosConfig: AxiosRequestConfig = {
		...config,
		method,
		url,
		data: payload,
	};
	const { data } = await axiosInstance.request<T>(axiosConfig);
	return data;
};

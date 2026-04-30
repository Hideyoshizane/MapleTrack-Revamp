import axiosInstance from './axios';

import type { AxiosRequestConfig } from 'axios';

export const requestApi = async <TResponse, TPayload = undefined>(
	url: string,
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
	payload?: TPayload,
	config?: AxiosRequestConfig,
): Promise<TResponse> => {
	const axiosConfig: AxiosRequestConfig = {
		...config,
		method,
		url,
		...(method === 'GET' ? { params: payload } : { data: payload }),
	};

	const { data } = await axiosInstance.request<TResponse>(axiosConfig);

	return data;
};

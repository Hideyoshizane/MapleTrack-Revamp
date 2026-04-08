import Cookies from 'universal-cookie';

import { SENSITIVE_METHODS } from '../security/security';

import axiosInstance from './axios';

import type { SensitiveMethod } from '../security/security';
import type { AxiosRequestConfig } from 'axios';

export const requestApi = async <TResponse, TPayload = undefined>(
	url: string,
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
	payload?: TPayload,
	config?: AxiosRequestConfig,
): Promise<TResponse> => {
	const headers: AxiosRequestConfig['headers'] = { ...config?.headers };

	const cookies = new Cookies();

	if (SENSITIVE_METHODS.includes(method as SensitiveMethod)) {
		const csrfToken = cookies.get<string>('csrf-token');
		if (csrfToken) {
			headers['x-csrf-token'] = csrfToken;
		}
	}
	const axiosConfig: AxiosRequestConfig = {
		...config,
		method,
		url,
		headers,
		...(method === 'GET' ? { params: payload } : { data: payload }),
	};
	const { data } = await axiosInstance.request<TResponse>(axiosConfig);
	return data;
};

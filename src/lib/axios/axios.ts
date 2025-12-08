import axios from 'axios';

import type { AxiosInstance } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 10000, // 10 seconds timeout
});

export default axiosInstance;

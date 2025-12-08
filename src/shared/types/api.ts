export type ApiResponse<T = undefined> = {
	success: boolean;
	message: string;
	data?: T;
};

export type ApiRequest<T> = T;

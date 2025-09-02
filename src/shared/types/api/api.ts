// Generic API response
export interface ApiResponse<T = undefined> {
	success: boolean;
	message?: string;
	error?: string;
	details?: Record<string, string | undefined>;
	data?: T;
}

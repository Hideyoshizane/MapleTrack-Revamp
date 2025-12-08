export const fetchWithTimeout = async (
	url: string,
	options: RequestInit = {},
	timeout = 10000 // default: 10s
): Promise<Response> => {
	const controller = new AbortController();
	const id = setTimeout((): void => controller.abort(), timeout);

	const enhancedOptions: RequestInit = {
		...options,
		signal: controller.signal,
	};

	try {
		return await fetch(url, enhancedOptions);
	} finally {
		clearTimeout(id);
	}
};

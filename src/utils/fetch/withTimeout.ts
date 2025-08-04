export function fetchWithTimeout(
	url: string,
	options: RequestInit = {},
	timeout = 10000 // default: 10s
): Promise<Response> {
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeout);

	const enhancedOptions: RequestInit = {
		...options,
		signal: controller.signal,
	};

	return fetch(url, enhancedOptions).finally(() => {
		clearTimeout(id);
	});
}

export const characterQueryKeys = {
	root: ['character'] as const,

	detail: (userOrigin: string, server: string, code: string) =>
		[...characterQueryKeys.root, userOrigin, server, code] as const,

	external: (name: string, server: string) => ['characterExternal', name, server] as const,
};

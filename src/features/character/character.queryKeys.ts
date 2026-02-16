export const characterQueryKeys = {
	root: ['character'] as const,

	detail: (server: string, code: string) => [...characterQueryKeys.root, server, code] as const,

	external: (name: string, server: string) => ['characterExternal', name, server] as const,
};

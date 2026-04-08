export const characterQueryKeys = {
	root: ['character'] as const,

	detail: (server: string, className: string) => [...characterQueryKeys.root, server, className] as const,

	external: (name: string, server: string) => ['characterExternal', server, name] as const,
};

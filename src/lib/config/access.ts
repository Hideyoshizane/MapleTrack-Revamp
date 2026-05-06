const PUBLIC_EXACT_PATHS = new Set<string>([
	'/',
	'/login',
	'/signup',
	'/forgot-password',
	'/reset-password',
	'/testpage',
	'/force-logout',
]);

const PUBLIC_PREFIX_PATHS: readonly string[] = ['/reset-password/'];

export const isPublicPath = (pathname: string): boolean => {
	if (PUBLIC_EXACT_PATHS.has(pathname)) {
		return true;
	}

	for (const prefix of PUBLIC_PREFIX_PATHS) {
		if (pathname.startsWith(prefix)) {
			return true;
		}
	}

	return false;
};

const PUBLIC_PATHS = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/testpage'] as const;

const PUBLIC_PATHS_SET = new Set(PUBLIC_PATHS);

export const isPublicPath = (pathname: string): boolean => {
	if (pathname === '/') {
		return PUBLIC_PATHS_SET.has('/');
	}

	// Direct or subpath of any public path
	for (const path of PUBLIC_PATHS_SET) {
		if (path !== '/' && (pathname === path || pathname.startsWith(`${path}/`))) {
			return true;
		}
	}

	return false;
};

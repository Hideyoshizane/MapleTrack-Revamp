// Define an array of paths that should use the dark theme
export const DARK_PATHS = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/testpage'] as const;

export type DarkPath = (typeof DARK_PATHS)[number];
export type Theme = 'light' | 'dark';

const DARK_PATHS_SET = new Set(DARK_PATHS);

export const themeFromPath = (pathname: string): Theme => {
	if (pathname === '/') {
		return DARK_PATHS_SET.has('/') ? 'dark' : 'light';
	}

	for (const path of DARK_PATHS_SET) {
		if (path !== '/' && (pathname === path || pathname.startsWith(`${path}/`))) {
			return 'dark';
		}
	}

	return 'light';
};

export const isDarkPath = (pathname: string): boolean => themeFromPath(pathname) === 'dark';

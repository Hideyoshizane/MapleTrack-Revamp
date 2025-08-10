// Define an array of paths that should use the dark theme
export const DARK_PATHS = ['/', '/login', '/signup', '/forgot-password', '/reset-password'] as const;
export type Theme = 'light' | 'dark';

export function themeFromPath(pathname: string): Theme {
	// Get the top-level route: e.g. /signup/step1 -> /signup
	const topLevelPath = '/' + pathname.split('/')[1];

	// Returns 'dark' if the pathname starts with any of the DARK_PATHS, otherwise 'light'
	return DARK_PATHS.includes(topLevelPath as (typeof DARK_PATHS)[number]) ? 'dark' : 'light';
}

// Define an array of paths that should use the dark theme
export const DARK_PATHS = ['/', '/login', '/signup', '/forgot-password', '/reset-password'] as const;
export type Theme = 'light' | 'dark';

export const themeFromPath = (pathname: string): Theme =>
	DARK_PATHS.some((darkPath: string): boolean => pathname === darkPath || pathname.startsWith(`${darkPath}/`))
		? 'dark'
		: 'light';

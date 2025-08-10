import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { DARK_PATHS, themeFromPath, type Theme } from '@lib/theme';

import type { NextRequest } from 'next/server';

// Middleware function to set 'theme' cookie and handle auth redirects
export async function middleware(req: NextRequest) {
	// Extract the current pathname from the request URL
	const { pathname } = req.nextUrl;

	// Determine theme ('dark' or 'light') based on pathname
	const theme: Theme = themeFromPath(pathname);

	const res = NextResponse.next();
	res.cookies.set('theme', theme, { path: '/' });

	// Retrieve the JWT token (if present) from the request to determine auth status
	const token = await getToken({ req });

	// Check if user is authenticated (token is non-null object)
	const isAuthenticated = !!token;

	// Narrow pathname to first segment for safer DARK_PATHS check
	const topLevelPath = '/' + pathname.split('/')[1];

	// Redirect authenticated users away from DARK_PATHS pages to /home
	if (isAuthenticated && DARK_PATHS.includes(topLevelPath as (typeof DARK_PATHS)[number])) {
		const url = req.nextUrl.clone();
		url.pathname = '/home';
		url.search = 'logged=1';
		return NextResponse.redirect(url);
	}

	// Redirect unauthenticated users from any page NOT in DARK_PATHS to login
	if (!isAuthenticated && !DARK_PATHS.includes(topLevelPath as (typeof DARK_PATHS)[number])) {
		const url = req.nextUrl.clone();
		url.pathname = '/login';
		url.search = 'unauthorized=1';
		return NextResponse.redirect(url);
	}

	// Otherwise, continue as normal
	return res;
}

// Only match real pages, excluding static assets, APIs, and files with extensions
export const config = {
	matcher: [
		'/login',
		'/signup',
		'/forgot-password',
		'/reset-password',
		'/home',
		'/((?!_next/static|_next/image|favicon.ico|api|.*\\..*).*)',
	],
};

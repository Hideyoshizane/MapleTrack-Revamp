import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { themeFromPath, isDarkPath, type Theme } from '@lib/config/theme';

import { LASTVERSION } from './data/user/constants';

import type { NextRequest } from 'next/server';

// Helper to clear NextAuth cookies
const clearAuthCookies = (res: NextResponse): void => {
	res.cookies.delete('next-auth.session-token');
	res.cookies.delete('__Secure-next-auth.session-token');
};

// Middleware to set 'theme' cookie and handle auth redirects
export const proxy = async (req: NextRequest): Promise<NextResponse> => {
	const { pathname } = req.nextUrl;

	// Skip static files and API routes
	if (/^\/(_next|api)|\.[a-z0-9]+$/i.test(pathname)) {
		return NextResponse.next();
	}

	// Set theme cookie
	const theme: Theme = themeFromPath(pathname);
	const res = NextResponse.next();
	res.cookies.set('theme', theme, { path: '/' });

	// Check auth token
	const token = await getToken({ req });
	const isAuthenticated = !!token;

	// VERSION CHECK: redirect if token version mismatch
	if (isAuthenticated) {
		const tokenVersion = Number(token?.version ?? 0);

		if (tokenVersion !== LASTVERSION) {
			const url = new URL('/login', req.url);
			url.search = 'version_update=1';
			const logoutResponse = NextResponse.redirect(url);
			clearAuthCookies(logoutResponse);

			return logoutResponse;
		}
	}

	// Determine top-level path safely
	const segments = pathname.split('/').filter(Boolean);
	const topLevelPath = '/' + (segments[0] ?? '');

	// Redirect authenticated users away from DARK_PATHS pages to /home
	if (isAuthenticated && isDarkPath(topLevelPath)) {
		return NextResponse.redirect(new URL('/home?logged=1', req.url));
	}

	// Redirect unauthenticated users from any page NOT in DARK_PATHS to login
	if (!isAuthenticated && !isDarkPath(topLevelPath)) {
		return NextResponse.redirect(new URL('/login?unauthorized=1', req.url));
	}

	return res;
};

// Only match real pages, excluding static assets, APIs, and files with extensions
export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};

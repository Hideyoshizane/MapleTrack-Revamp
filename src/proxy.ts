import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { isPublicPath } from '@/lib/config/access';

import { LASTVERSION } from './data/user/constants';

import type { NextRequest } from 'next/server';

const clearAuthCookies = (res: NextResponse): void => {
	// Main session token
	res.cookies.delete('authjs.session-token');

	// OAuth helpers
	res.cookies.delete('authjs.callback-url');
	res.cookies.delete('authjs.csrf-token');
};

export const proxy = async (req: NextRequest): Promise<NextResponse> => {
	const { pathname } = req.nextUrl;

	// Skip static files and API routes
	if (/^\/(_next|api)|\.[a-z0-9]+$/i.test(pathname)) {
		return NextResponse.next();
	}

	const token = await getToken({ req, secret: process.env.AUTH_SECRET });

	const isAuthenticated = Boolean(token);

	// VERSION CHECK: redirect if token version mismatch
	if (isAuthenticated) {
		const tokenVersion = Number(token?.version ?? 0);

		if (tokenVersion !== LASTVERSION) {
			const url = new URL('/login', req.url);
			url.search = 'version_update=1';

			const res = NextResponse.redirect(url);
			clearAuthCookies(res);

			return res;
		}
	}

	const segments = pathname.split('/').filter(Boolean);
	const topLevelPath = '/' + (segments[0] ?? '');

	// Redirect authenticated users to /home
	if (isAuthenticated && isPublicPath(topLevelPath)) {
		return NextResponse.redirect(new URL('/home?logged=1', req.url));
	}

	// Redirect unauthenticated users
	if (!isAuthenticated && !isPublicPath(topLevelPath)) {
		return NextResponse.redirect(new URL('/login?unauthorized=1', req.url));
	}

	return NextResponse.next();
};

// Only match real pages, excluding static assets, APIs, and files with extensions
export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};

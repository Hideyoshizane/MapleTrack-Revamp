import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { isPublicPath } from '@lib/config/access';
import { enforceVersion } from '@lib/config/tokenChange';
import { generateCsrfToken } from '@lib/security/security';

import type { NextRequest } from 'next/server';

export const proxy = async (req: NextRequest): Promise<NextResponse> => {
	const { pathname } = req.nextUrl;

	// Skip static files and API routes
	if (/^\/(_next|api)|\.[a-z0-9]+$/i.test(pathname)) {
		return NextResponse.next();
	}

	const token = await getToken({ req, secret: process.env.AUTH_SECRET });
	const isAuthenticated = Boolean(token);

	// Redirect if token version mismatch
	const versionCheck = await enforceVersion(req);
	if (versionCheck) {
		return versionCheck;
	}

	const segments = pathname.split('/').filter(Boolean);
	const topLevelPath = '/' + (segments[0] ?? '');

	let response: NextResponse;

	if (isAuthenticated && isPublicPath(topLevelPath)) {
		// Redirect authenticated users to /home
		response = NextResponse.redirect(new URL('/home?logged=1', req.url));
	} else if (!isAuthenticated && !isPublicPath(topLevelPath)) {
		// Redirect unauthenticated users
		response = NextResponse.redirect(new URL('/login?unauthorized=1', req.url));
	} else {
		response = NextResponse.next();
	}

	const newToken = generateCsrfToken();
	response.cookies.set('csrf-token', newToken, {
		path: '/',
		httpOnly: false,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
	});

	return response;
};

// Only match real pages, excluding static assets, APIs, and files with extensions
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'] };

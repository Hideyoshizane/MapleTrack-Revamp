import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { LASTVERSION } from '@data/user/constants';
import { isPublicPath } from '@lib/config/access';
import { generateCsrfToken } from '@lib/security/security';

export const proxy = auth((req) => {
	const session = req.auth;
	const { pathname, searchParams } = req.nextUrl;

	// Skip static + API
	if (/^\/(_next|api)|\.[a-z0-9]+$/i.test(pathname)) {
		return NextResponse.next();
	}

	if (session?.user && pathname !== '/force-logout') {
		const tokenVersion = Number(session.user.version ?? -1);

		if (tokenVersion !== LASTVERSION) {
			const url = new URL('/force-logout', req.url);
			url.searchParams.set('reason', 'version_update');

			return NextResponse.redirect(url);
		}
	}

	const isVersionRedirect = searchParams.has('version_update');
	const isAuthenticated = Boolean(session);
	const topLevelPath = '/' + (pathname.split('/').filter(Boolean)[0] ?? '');

	let response: NextResponse;

	if (isAuthenticated && isPublicPath(topLevelPath) && !isVersionRedirect) {
		response = NextResponse.redirect(new URL('/home?logged=1', req.url));
	} else if (!isAuthenticated && !isPublicPath(topLevelPath) && !isVersionRedirect) {
		response = NextResponse.redirect(new URL('/login?unauthorized=1', req.url));
	} else {
		response = NextResponse.next();
	}

	if (!req.cookies.get('csrf-token')) {
		response.cookies.set('csrf-token', generateCsrfToken(), {
			path: '/',
			httpOnly: false,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
		});
	}

	return response;
});

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'] };

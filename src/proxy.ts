import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { LASTVERSION } from '@data/user/constants';
import { isPublicPath } from '@lib/config/access';

export const proxy = auth((req) => {
	const session = req.auth;
	const { pathname, searchParams } = req.nextUrl;

	// Skip static + API
	if (/^\/(_next|api)|\.[a-z0-9]+$/i.test(pathname)) {
		return NextResponse.next();
	}

	const isAuthenticated = typeof session?.user?.id === 'string';
	const isVersionRedirect = searchParams.get('reason') === 'version_update';

	if (pathname === '/login') {
		return NextResponse.next();
	}

	if (isAuthenticated && pathname !== '/force-logout') {
		const tokenVersion = Number(session.user.version ?? -1);

		if (tokenVersion !== LASTVERSION) {
			const url = new URL('/force-logout', req.url);
			url.searchParams.set('reason', 'version_update');

			return NextResponse.redirect(url);
		}
	}

	// Prevent logged-in users from accessing public auth pages
	if (isAuthenticated && !isVersionRedirect) {
		if (pathname === '/') {
			return NextResponse.redirect(new URL('/home', req.url));
		}

		if (isPublicPath(pathname)) {
			return NextResponse.redirect(new URL('/home?logged=1', req.url));
		}
	}

	// Prevent unauthenticated users from accessing protected pages
	if (!isAuthenticated && !isPublicPath(pathname) && !isVersionRedirect) {
		return NextResponse.redirect(new URL('/login?unauthorized=1', req.url));
	}

	return NextResponse.next();
});

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'] };

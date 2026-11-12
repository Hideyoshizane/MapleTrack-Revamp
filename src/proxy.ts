import { NextResponse } from 'next/server';

import { auth } from '@/auth';

import { LASTVERSION } from '@data/user/constants';
import { isPublicPath } from '@lib/config/access';

import type { NextRequest } from 'next/server';

export async function proxy(req: NextRequest): Promise<NextResponse> {
	const { pathname, searchParams } = req.nextUrl;

	// Skip static assets and API routes.
	if (/^\/(_next|api)|\.[a-z0-9]+$/i.test(pathname)) {
		return NextResponse.next();
	}

	const session = await auth.api.getSession({ headers: req.headers });

	// Allow access to the login page.
	if (pathname === '/login') {
		return NextResponse.next();
	}

	const isAuthenticated = typeof session?.user?.id === 'string';
	const isVersionRedirect = pathname === '/force-logout' && searchParams.get('reason') === 'version_update';

	// Force users with outdated versions to log out.
	if (isAuthenticated && pathname !== '/force-logout') {
		const userVersion = Number(session.user.version ?? -1);
		if (userVersion !== LASTVERSION) {
			const url = new URL('/force-logout', req.url);
			url.searchParams.set('reason', 'version_update');

			return NextResponse.redirect(url);
		}
	}

	// Prevent authenticated users from accessing public pages.
	if (isAuthenticated && !isVersionRedirect) {
		if (pathname === '/') {
			return NextResponse.redirect(new URL('/home', req.url));
		}

		if (isPublicPath(pathname)) {
			return NextResponse.redirect(new URL('/home?logged=1', req.url));
		}
	}

	// Prevent unauthenticated users from accessing protected pages.
	if (!isAuthenticated && !isPublicPath(pathname) && !isVersionRedirect) {
		return NextResponse.redirect(new URL('/login?unauthorized=1', req.url));
	}

	return NextResponse.next();
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'] };

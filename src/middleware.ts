import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { themeFromPath } from '@lib/theme';

// Middleware function to set a 'theme' cookie based on the current pathname
export function middleware(req: NextRequest) {
	// Extract the current pathname from the request URL
	const { pathname } = req.nextUrl;

	// Skip middleware for static files, APIs, or anything with a file extension
	if (pathname.startsWith('/_next') || pathname.startsWith('/api') || /\.[^/]+$/.test(pathname)) {
		return NextResponse.next();
	}
	// Determine the theme based on the pathname
	const theme = themeFromPath(pathname);

	// Set cookie with the determined theme, valid for the entire site
	const res = NextResponse.next();
	res.cookies.set('theme', theme, {
		path: '/',
		sameSite: 'lax',
	});
	return res;
}

// Only match actual pages, skip static files and APIs
// This regex means: "match anything not starting with _next or api or containing a file extension"
export const config = {
	matcher: ['/((?!_next|api|.*\\..*).*)'],
};

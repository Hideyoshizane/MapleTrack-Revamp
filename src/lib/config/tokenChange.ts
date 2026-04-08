import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { LASTVERSION } from '@data/user/constants';

import type { NextRequest } from 'next/server';

export const enforceVersion = async (req: NextRequest, res?: NextResponse): Promise<NextResponse | null> => {
	const token = await getToken({ req, secret: process.env.AUTH_SECRET });
	if (!token) return null;

	const tokenVersion = Number(token?.version ?? 0);
	if (tokenVersion !== LASTVERSION) {
		const url = new URL('/login', req.url);
		url.search = 'version_update=1';

		const redirectRes = res ?? NextResponse.redirect(url);
		redirectRes.cookies.delete('authjs.session-token');
		redirectRes.cookies.delete('authjs.callback-url');
		redirectRes.cookies.delete('authjs.csrf-token');
		redirectRes.cookies.delete('csrf-token');

		return redirectRes;
	}
	return null;
};

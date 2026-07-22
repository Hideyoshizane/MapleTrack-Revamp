import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { LASTVERSION } from '@data/user/constants';
import { credentialsSchema } from '@features/user/schemas/user.schema';
import { updateLastLogin, updateUserVersion } from '@features/user/userService';
import { prisma } from '@lib/prisma';
import { verifyPassword, DUMMY_HASH } from '@lib/security/password';

import { updateMissingSymbolsForCharacters } from './features/character/characterUpdate';

type AppUser = {
	id: string;
	username: string;
	version: number;
};

function isAppUser(user: unknown): user is AppUser {
	return (
		typeof user === 'object' &&
		user !== null &&
		typeof (user as AppUser).id === 'string' &&
		typeof (user as AppUser).username === 'string' &&
		typeof (user as AppUser).version === 'number'
	);
}
type AppJWT = {
	id: string;
	username: string;
	version: number;
	[key: string]: unknown;
};

export const { auth, handlers } = NextAuth({
	trustHost: true,
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				username: { label: 'Username', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},

			authorize: async (credentials) => {
				try {
					const parsedResult = credentialsSchema.safeParse(credentials);
					if (!parsedResult.success) {
						return null;
					}

					const { username, password } = parsedResult.data;

					const user = await prisma.user.findUnique({ where: { username } });
					if (!user) {
						await verifyPassword(DUMMY_HASH, password);
						return null;
					}

					const isValid = await verifyPassword(user.password, password);
					if (!isValid) {
						return null;
					}

					const nextVersion = user.version < LASTVERSION ? LASTVERSION : user.version;

					await Promise.all([
						updateLastLogin(user.id),
						updateMissingSymbolsForCharacters(user.id),
						user.version < LASTVERSION ? updateUserVersion(user.id) : Promise.resolve(),
					]);

					return { id: user.id, username: user.username, version: nextVersion };
				} catch (err) {
					console.error('Authorize error:', err);
					return null;
				}
			},
		}),
	],
	logger: {
		error: (...args) => {
			console.error('[NextAuth ERROR]', ...args);
		},
		warn: (...args) => {
			console.warn('[NextAuth WARN]', ...args);
		},
		debug: (...args) => {
			console.warn('[NextAuth DEBUG]', ...args);
		},
	},
	session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 60 },
	jwt: { maxAge: 60 * 60 * 24 * 60 },
	cookies: {
		sessionToken: {
			options: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' },
		},
	},
	callbacks: {
		jwt: ({ token, user }) => {
			if (user && isAppUser(user)) {
				(token as AppJWT).id = user.id;
				(token as AppJWT).username = user.username;
				(token as AppJWT).version = user.version ?? 0;
			}
			return token;
		},
		session: ({ session, token }) => {
			const tokenData = token as AppJWT;

			if (!tokenData?.id) {
				return session;
			}

			return {
				...session,
				user: {
					...session.user,
					id: tokenData.id,
					username: tokenData.username,
					version: tokenData.version ?? 0,
				},
			};
		},
		redirect: ({ url, baseUrl }) => {
			if (url.startsWith('/')) {
				return `${baseUrl}${url}`;
			}
			if (url.startsWith(baseUrl)) {
				return url;
			}

			return baseUrl;
		},
	},
	pages: { signIn: '/login', error: '/login' },
	secret: process.env.NEXTAUTH_SECRET,
});

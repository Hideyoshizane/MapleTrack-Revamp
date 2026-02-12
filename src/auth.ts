import argon2 from 'argon2';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { LASTVERSION } from '@data/user/constants';
import { updateLastLogin, updateUserVersion } from '@features/user/userService';
import { prisma } from '@lib/prisma';
import { sanitizeInputBackEnd } from '@utils/sanitizeInputBackEnd';
import { validateUsernameLogin, validatePasswordLogin } from '@utils/validators';

import { canonicalizeUsername } from './features/user/canonicalUsername';

import type { DefaultSession } from 'next-auth';

export type AppUser = {
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
export type AppJWT = {
	id: string;
	username: string;
	version: number;
	[key: string]: unknown;
};

export type AppSession = DefaultSession & {
	user: {
		id: string;
		username: string;
		version: number;
	} & DefaultSession['user'];
};

type LoginCredentials = { username: string; password: string };

export const { auth, handlers, signIn, signOut } = NextAuth({
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				username: { label: 'Username', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},

			authorize: async (credentials) => {
				try {
					if (!credentials?.username || !credentials?.password) {
						return null;
					}

					const { username, password } = credentials as LoginCredentials;
					const cleanUsername = canonicalizeUsername(username);
					const cleanPassword = sanitizeInputBackEnd(password);

					if (!cleanUsername || !cleanPassword) {
						return null;
					}

					const usernameValid = validateUsernameLogin(cleanUsername);
					const passwordValid = validatePasswordLogin(cleanPassword);
					if (!usernameValid.isValid || !passwordValid.isValid) {
						return null;
					}

					const user = await prisma.user.findUnique({
						where: { username: cleanUsername },
					});

					const dummyHash =
						'$argon2id$v=19$m=65536,t=3,p=4$uX1p9U1nE8p4cXb3rFxNcg$hX57IVHIUi7fYcl0jYxA/0hhQ2PzefRgQdIMZcPgYG8';

					if (!user) {
						await argon2.verify(dummyHash, cleanPassword).catch(() => null);
						return null;
					}

					const isValid = await argon2.verify(user.password, cleanPassword);
					if (!isValid) {
						return null;
					}

					await Promise.all([
						updateLastLogin(user.id),
						user.version < LASTVERSION ? updateUserVersion(user.id) : Promise.resolve(),
					]);

					return { id: user.id, username: user.username, version: user.version ?? 0 };
				} catch (err) {
					console.error('Authorize error:', err);
					return null;
				}
			},
		}),
	],
	logger: {
		error: () => {},
		warn: () => {},
		debug: () => {},
	},
	session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 60 },
	jwt: { maxAge: 60 * 60 * 24 * 60 },
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
			const t = token as AppJWT;
			return {
				...session,
				user: {
					...session.user,
					id: t.id,
					username: t.username,
					version: t.version ?? 0,
				},
			} as AppSession;
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
	secret: process.env.AUTH_SECRET,
});

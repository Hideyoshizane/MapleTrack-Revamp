import Credentials from '@auth/core/providers/credentials';
import argon2 from 'argon2';

import { LASTVERSION } from '@data/user/constants';
import UserMongo from '@features/user/userModel';
import { updateLastLogin, updateUserVersion } from '@features/user/userService';
import connectToDatabase from '@lib/mongooseConect';
import { sanitizeInputBackEnd } from '@utils/sanitizeInputBackEnd';
import { validateUsernameLogin, validatePasswordLogin } from '@utils/validators';

import type { AuthConfig } from '@auth/core';

type LoginCredentials = { username: string; password: string };

export type AppUser = {
	id: string;
	username: string;
	version: number;
};

function isAppUser(user: unknown): user is AppUser {
	return !!user && typeof (user as AppUser).id === 'string';
}

export const authOptions: AuthConfig = {
	session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 60 },
	jwt: { maxAge: 60 * 60 * 24 * 60 },
	providers: [
		Credentials({
			name: 'Credentials',
			credentials: { username: { label: 'Username', type: 'text' }, password: { label: 'Password', type: 'password' } },
			authorize: async (credentials): Promise<AppUser | null> => {
				if (!credentials) {
					throw new Error('Missing credentials');
				}

				const { username, password } = credentials as LoginCredentials;
				const cleanUsername = sanitizeInputBackEnd(username ?? '');
				const cleanPassword = sanitizeInputBackEnd(password ?? '');

				if (!cleanUsername || !cleanPassword) {
					throw new Error('Missing username or password');
				}

				const usernameValidation = validateUsernameLogin(cleanUsername);
				const passwordValidation = validatePasswordLogin(cleanPassword);
				if (!usernameValidation.isValid || !passwordValidation.isValid) {
					throw new Error('Invalid username or password');
				}

				await connectToDatabase();
				const user = await UserMongo.findOne({ username: cleanUsername });

				const dummyHash =
					'$argon2id$v=19$m=65536,t=3,p=4$uX1p9U1nE8p4cXb3rFxNcg$hX57IVHIUi7fYcl0jYxA/0hhQ2PzefRgQdIMZcPgYG8';

				if (!user) {
					await argon2.verify(dummyHash, password).catch(() => null);
					throw new Error('Wrong username or password');
				}

				const isValid = await argon2.verify(user.password, cleanPassword);
				if (!isValid) {
					throw new Error('Wrong username or password');
				}

				updateLastLogin(user);
				updateUserVersion(user);
				await user.save();

				return { id: user._id.toString(), username: user.username, version: user.version ?? LASTVERSION };
			},
		}),
	],
	callbacks: {
		// JWT callback
		jwt: ({ token, user }) => {
			if (user && isAppUser(user)) {
				token.id = user.id;
				token.username = user.username;
				token.version = user.version ?? LASTVERSION;
			}
			return token;
		},

		// Session callback
		session: ({ session, token }) => ({
			...session,
			user: {
				...session.user,
				id: token.id,
				username: token.username,
				version: token.version ?? LASTVERSION,
			},
		}),

		redirect: ({ url, baseUrl }) => (url.startsWith('/api') ? baseUrl : url.startsWith(baseUrl) ? url : baseUrl),
	},
	pages: { signIn: '/login' },
	secret: process.env.NEXTAUTH_SECRET,
};

import argon2 from 'argon2';
import CredentialsProvider from 'next-auth/providers/credentials';

import { LASTVERSION } from '@data/user/constants';
import UserMongo from '@features/user/userModel';
import { updateLastLogin, updateUserVersion } from '@features/user/userService';
import connectToDatabase from '@lib/mongooseConect';
import { sanitizeInputBackEnd } from '@utils/sanitizeInputBackEnd';
import { validateUsernameLogin, validatePasswordLogin } from '@utils/validators';

import type { AuthOptions, User, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

export const authOptions: AuthOptions = {
	session: {
		strategy: 'jwt',
		maxAge: 60 * 60 * 24 * 60, // 60 days (session expiration time)
	},
	jwt: {
		maxAge: 60 * 60 * 24 * 60, // 60 days (token expiration)
	},
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				username: { label: 'Username', type: 'text', placeholder: 'Your Username' },
				password: { label: 'Password', type: 'Password' },
			},
			async authorize(credentials): Promise<User | null> {
				await connectToDatabase();

				// Sanitize inputs
				const username = sanitizeInputBackEnd(credentials?.username ?? '');
				const password = sanitizeInputBackEnd(credentials?.password ?? '');

				if (!username || !password) {
					throw new Error('Missing username or password');
				}

				// Validate sanitized inputs
				const usernameValidation = validateUsernameLogin(username);
				const passwordValidation = validatePasswordLogin(password);

				if (!usernameValidation.isValid || !passwordValidation.isValid) {
					throw new Error('Invalid username or password');
				}

				// Find user in DB
				const user = await UserMongo.findOne({ username });

				const dummyHash =
					'$argon2id$v=19$m=65536,t=3,p=4$uX1p9U1nE8p4cXb3rFxNcg$hX57IVHIUi7fYcl0jYxA/0hhQ2PzefRgQdIMZcPgYG8';

				if (!user) {
					await argon2.verify(dummyHash, password).catch((): null => null);
					throw new Error('Wrong username or password');
				}

				// Compare password hash
				const isValid = await argon2.verify(user.password, password);
				if (!isValid) {
					throw new Error('Wrong username or password');
				}

				updateLastLogin(user);
				updateUserVersion(user);

				//User specific functions.
				/*if (user.version < LASTVERSION) {
			await searchServersAndCreateMissing(user, user._id);
			await createMissingCharacters(user._id, user.username);
			await updateCharacters(user._id);
			await updateUserVersion(user._id); 	
		        }*/

				await user.save();

				// Return user object stored in JWT
				return {
					id: user._id.toString(),
					username: user.username,
					version: user.version ?? LASTVERSION,
				};
			},
		}),
	],
	callbacks: {
		// Customize JWT token content
		jwt({ token, user }: { token: JWT; user?: User | undefined }): JWT {
			if (user) {
				token.id = user.id;
				token.username = user.username;
				token.version = user.version ?? LASTVERSION;
			}
			return token;
		},
		// Customize session object returned to client
		session({ session, token }: { session: Session; token: JWT }): Session {
			if (token) {
				session.user = {
					id: token.id,
					username: token.username,
					version: token.version as number,
				};
			}
			return session;
		},
		// Prevent redirects for API routes
		redirect({ url, baseUrl }): string {
			if (url.startsWith('/api')) {
				return baseUrl; // don’t redirect API calls
			}
			return url.startsWith(baseUrl) ? url : baseUrl;
		},
	},
	pages: {
		signIn: '/login',
	},
	secret: process.env.NEXTAUTH_SECRET,
};

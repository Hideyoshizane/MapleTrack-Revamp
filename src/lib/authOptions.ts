import bcrypt from 'bcrypt';
import { type AuthOptions, User, Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { updateLastLogin } from '@/service/userService';
import connectToDatabase from '@lib/mongooseConect';
import UserMongo from '@models/user';
import { sanitizeInputBackEnd } from '@utils/sanitize/sanitizeInputBackEnd';
import { validateUsernameLogin, validatePasswordLogin } from '@utils/validation';

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
			async authorize(credentials): Promise<{ id: string; username: string } | null> {
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
				if (!user) {
					await bcrypt.compare(password, '$2b$10$invalidhashstring0000000000000000000000');
					throw new Error('Wrong username or password');
				}

				// Compare password hash
				const isValid = await bcrypt.compare(password, user.password);
				if (!isValid) {
					throw new Error('Wrong username or password');
				}

				updateLastLogin(user);

				//User specific functions.
				/*if (user.version < LASTVERSION) {
			await searchServersAndCreateMissing(user, user._id);
			await createMissingCharacters(user._id, user.username);
			await updateCharacters(user._id);
			await updateUserVersion(user._id); 	
		        }*/

				await user.save();

				// Return user object (will be saved in JWT token)
				return {
					id: user._id.toString(),
					username: user.username,
				};
			},
		}),
	],
	callbacks: {
		// Customize JWT token content
		jwt({ token, user }: { token: JWT; user?: User | undefined }) {
			if (user) {
				token.id = user.id;
				token.username = user.username;
			}
			return token;
		},
		// Customize session object returned to client
		session({ session, token }: { session: Session; token: JWT }) {
			if (token) {
				session.user = {
					id: token.id as string,
					username: token.username as string,
				};
			}
			return session;
		},
	},
	pages: {
		signIn: '/login',
	},
	secret: process.env.NEXTAUTH_SECRET,
};

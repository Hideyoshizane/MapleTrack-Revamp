import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

import { LASTVERSION } from '@data/user/constants';
import { updateLastLogin, updateUserVersion } from '@features/user/userService';
import { prisma } from '@lib/prisma';
import { hashPassword, verifyPassword } from '@lib/security/password';

import { removeInvalidBosses } from './features/boss/removeInvalidBosses';
import { updateMissingSymbolsForCharacters } from './features/character/characterUpdate';

// 60 days
const SESSION_MAX_AGE = 60 * 60 * 24 * 60;

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL,
	secret: process.env.BETTER_AUTH_SECRET,

	database: prismaAdapter(prisma, { provider: 'postgresql' }),

	emailAndPassword: {
		enabled: true,
		disableSignUp: true,
		password: { hash: hashPassword, verify: async ({ hash, password }) => verifyPassword(hash, password) },
	},

	user: { additionalFields: { version: { type: 'number', required: true, input: false } } },

	session: { expiresIn: SESSION_MAX_AGE },

	advanced: {
		database: { generateId: 'uuid' },
		useSecureCookies: process.env.NODE_ENV === 'production',
		defaultCookieAttributes: {
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			path: '/',
		},
	},

	rateLimit: { enabled: true, window: 60, max: 100, customRules: { '/sign-in/email': { window: 60, max: 10 } } },

	databaseHooks: {
		session: {
			create: {
				before: async (session) => {
					try {
						const user = await prisma.user.findUnique({
							where: { id: session.userId },
							select: { id: true, version: true },
						});
						if (!user) {
							throw new Error(`User ${session.userId} was not found while creating a session.`);
						}

						const tasks: Promise<unknown>[] = [updateLastLogin(user.id)];

						if (user.version < LASTVERSION) {
							tasks.push(updateUserVersion(user.id));
							tasks.push(updateMissingSymbolsForCharacters(user.id));
							tasks.push(removeInvalidBosses(user.id));
						}

						await Promise.all(tasks);

						return { data: session };
					} catch (error) {
						console.error('[Better Auth] Session creation hook failed:', error);
						throw error;
					}
				},
			},
		},
	},

	logger: { level: process.env.NODE_ENV === 'development' ? 'debug' : 'error' },
});

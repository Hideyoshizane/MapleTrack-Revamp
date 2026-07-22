import type { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
	interface Session {
		user: {
			id: string;
			username: string;
			version: number;
		} & DefaultSession['user'];
	}

	interface User extends DefaultUser {
		id: string;
		username: string;
		version: number;
	}
}

declare module '@auth/core/jwt' {
	interface JWT {
		id: string;
		username: string;
		version: number;
	}
}

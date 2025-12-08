// src/auth.ts
import { Auth } from '@auth/core';

import { authOptions } from '@/authOptions';

import type { AppUser } from '@/authOptions';

export type SessionResponse = {
	user: AppUser;
	expires: string;
};

export const auth = async (): Promise<SessionResponse | null> => {
	const res = await Auth(new Request('http://localhost'), authOptions);
	const data = (await res.json()) as SessionResponse;

	return data?.user ? data : null;
};

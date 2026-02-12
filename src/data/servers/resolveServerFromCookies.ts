import { cookies } from 'next/headers';

import { DEFAULT_SERVER_NAME, getServerByName, type ServerName } from './servers';

export const resolveServerFromCookies = async (): Promise<ServerName> => {
	const cookieStore = await cookies();
	const raw = cookieStore.get('server')?.value;

	return getServerByName(raw)?.name ?? DEFAULT_SERVER_NAME;
};

'use client';

import { useCallback, useEffect, useState } from 'react';

import { serverCookie } from '@utils/serverCookie';

import type { ServerName } from '@data/servers/servers';

export const useServerCookie = (
	initialServer: ServerName,
): {
	server: ServerName;
	setServerCookie: (name: ServerName) => void;
} => {
	const [server, setServer] = useState<ServerName>(initialServer);

	useEffect((): void => {
		serverCookie.set([server]);
	}, [server]);

	const setServerCookieHandler = useCallback((name: ServerName): void => {
		setServer(name);
	}, []);

	return { server, setServerCookie: setServerCookieHandler };
};

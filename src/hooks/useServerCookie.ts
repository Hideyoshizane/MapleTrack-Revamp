import { useState, useEffect } from 'react';

import { serverCookie, SERVER_OPTIONS, type ServerOption } from '@utils/cookies/serverCookie';

export const useServerCookie = (): {
	server: ServerOption;
	setServerCookie: (name: ServerOption) => void;
} => {
	// State typed to exact allowed server names
	const [server, setServer] = useState<ServerOption>('Scania');

	useEffect(() => {
		// Get current cookie (can be array or undefined)
		const current = serverCookie.get();
		const firstValue = Array.isArray(current) ? current[0] : current;

		// Validate cookie: fallback to 'Scania' if missing or invalid
		const validServer: ServerOption = SERVER_OPTIONS.includes(firstValue ?? '')
			? (firstValue as ServerOption)
			: 'Scania';

		setServer(validServer);
		serverCookie.set([validServer]);
	}, []);

	const setServerStateAndCookie = (name: ServerOption): void => {
		setServer(name);
		serverCookie.set([name]);
	};

	return { server, setServerCookie: setServerStateAndCookie };
};

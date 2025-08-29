import { useState, useEffect } from 'react';

import { serverCookie, SERVER_OPTIONS, type ServerOption } from '@utils/cookies/serverCookie';

export const useServerCookie = () => {
	// State typed to exact allowed server names
	const [server, setServer] = useState<ServerOption>('Scania');

	useEffect(() => {
		// Get current cookie (returns array or undefined in new CookieManager)
		const current = serverCookie.get();
		const firstValue = Array.isArray(current) ? current[0] : current;

		// Validate cookie: if invalid or missing, fallback to 'Scania'
		const validServer: ServerOption = SERVER_OPTIONS.includes(firstValue ?? '')
			? (firstValue as ServerOption)
			: 'Scania';

		setServer(validServer);
		serverCookie.set([validServer]); // store as single-value array
	}, []);

	const setServerStateAndCookie = (name: ServerOption) => {
		setServer(name);
		serverCookie.set([name]); // store as single-value array
	};

	return { server, setServerCookie: setServerStateAndCookie };
};

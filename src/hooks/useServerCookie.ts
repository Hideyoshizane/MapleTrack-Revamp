import { useState, useEffect } from 'react';

import { getServerCookie, setServerCookie as setCookie } from '@utils/cookies/serverCookie';

export const useServerCookie = () => {
	const [server, setServer] = useState<string | undefined>(undefined);

	useEffect(() => {
		const current = getServerCookie() || 'Scania';
		setServer(current);
		setCookie(current);
	}, []);

	const setServerCookie = (name: string) => {
		setServer(name);
		setCookie(name);
	};

	return { server, setServerCookie };
};

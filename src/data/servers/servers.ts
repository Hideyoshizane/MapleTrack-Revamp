import serversJson from './servers.json';

import type { Server } from '@sharedTypes/server';

export const servers: Server[] = serversJson as Server[];

export const SERVER_NAMES = servers.map((server): string => server.name) as readonly string[];

export type ServerName = (typeof SERVER_NAMES)[number];

export const DEFAULT_SERVER_NAME: ServerName = 'Scania';

if (!servers.some((s): boolean => s.name === DEFAULT_SERVER_NAME)) {
	throw new Error(`Default server "${DEFAULT_SERVER_NAME}" does not exist`);
}

export const getServerByName = (name: string | undefined): Server | undefined => {
	if (!name) {
		return undefined;
	}

	return servers.find((server): boolean => server.name.toLowerCase() === name.toLowerCase());
};

export const isRebootServer = (serverName: string): boolean => {
	const server = servers.find((s): boolean => s.name.toLowerCase() === serverName.toLowerCase());

	// If server exists, return its Reboot status, otherwise return false
	return server?.Reboot ?? false;
};

export const getRegion = (server: Server): 'eu' | 'na' =>
	server.name === 'Luna' || server.name === 'Solis' ? 'eu' : 'na';

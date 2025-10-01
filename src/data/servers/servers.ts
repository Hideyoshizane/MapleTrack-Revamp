import serversJson from './servers.json';

import type { Server } from '@sharedTypes/server';

export const servers: Server[] = serversJson as Server[];

// Check if a server is a Reboot server
export const isRebootServer = (serverName: string): boolean => {
	const server = servers.find((s): boolean => s.name.toLowerCase() === serverName.toLowerCase());

	// If server exists, return its Reboot status, otherwise return false
	return server?.Reboot ?? false;
};
// Get server region (EU or NA)
export const getRegion = (server: Server): 'eu' | 'na' =>
	server.name === 'Luna' || server.name === 'Solis' ? 'eu' : 'na';

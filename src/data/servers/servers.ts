import serversJson from './servers.json';

import type { Server } from '@sharedTypes/server';

export const servers: Server[] = serversJson as Server[];

export function isRebootServer(serverName: string): boolean {
	const server = servers.find((s) => s.name.toLowerCase() === serverName.toLowerCase());

	// If server exists, return its Reboot status, otherwise return false
	return server ? server.Reboot : false;
}

export function getRegion(server: Server): 'eu' | 'na' {
	// Check if the server name is Luna or Solis
	return server.name === 'Luna' || server.name === 'Solis' ? 'eu' : 'na';
}

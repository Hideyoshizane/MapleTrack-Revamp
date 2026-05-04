import serversJson from './servers.json';

export type Server = {
	name: string;
	img: string;
	Reboot: boolean;
};

export const servers: Server[] = serversJson as Server[];

export const SERVER_NAMES = servers.map((server): string => server.name) as readonly string[];

export type ServerName = (typeof SERVER_NAMES)[number];

export const DEFAULT_SERVER_NAME: ServerName = 'Bera';

const serversMap: ReadonlyMap<string, Server> = new Map(
	servers.map((server): [string, Server] => [server.name.toLowerCase(), server]),
);

export const getServerByName = (name: string | undefined): Server | undefined => {
	if (!name) {
		return undefined;
	}
	return serversMap.get(name.toLowerCase());
};

export const getServerImageByName = (serverName: string | undefined): string => {
	if (!serverName) {
		return '';
	}

	return serversMap.get(serverName.toLowerCase())?.img ?? '';
};

export const isRebootServer = (serverName: string): boolean => {
	return serversMap.get(serverName.toLowerCase())?.Reboot ?? false;
};

export const isValidServerName = (serverName: string | undefined): boolean => {
	if (!serverName) {
		return false;
	}

	return serversMap.has(serverName.toLowerCase());
};

export const getRegion = (server: Server): 'eu' | 'na' =>
	server.name === 'Luna' || server.name === 'Solis' ? 'eu' : 'na';

export const getServersExcept = (quantity: number, excludedServers: string[]): string[] => {
	if (quantity <= 0) {
		return [];
	}

	const excludedSet: Set<string> = new Set(excludedServers.map((server): string => server.toLowerCase()));

	const result: string[] = [];

	for (const server of servers) {
		if (excludedSet.has(server.name.toLowerCase())) {
			continue;
		}

		result.push(server.name);

		if (result.length === quantity) {
			break;
		}
	}

	return result;
};

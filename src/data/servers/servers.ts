import serversJson from './servers.json';

export type Server = {
	name: string;
	img: string;
	Reboot: boolean;
};

export const servers: Server[] = serversJson as Server[];

export const SERVER_NAMES = servers.map((server): string => server.name) as readonly string[];

export type ServerName = (typeof SERVER_NAMES)[number];

export const DEFAULT_SERVER_NAME: ServerName = 'Scania';

const serversMap: ReadonlyMap<string, Server> = new Map(
	servers.map((server): [string, Server] => [server.name.toLowerCase(), server]),
);

export const getServerByName = (name: string | undefined): Server | undefined => {
	if (!name) {
		return undefined;
	}
	return serversMap.get(name.toLowerCase());
};

export const getServerImageByName = (serverName: string): string | null => {
	const server: Server | undefined = serversMap.get(serverName.toLowerCase());
	return server?.img ?? null;
};

export const isRebootServer = (serverName: string): boolean => {
	return serversMap.get(serverName.toLowerCase())?.Reboot ?? false;
};

export const getRegion = (server: Server): 'eu' | 'na' =>
	server.name === 'Luna' || server.name === 'Solis' ? 'eu' : 'na';

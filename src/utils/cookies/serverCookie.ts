import servers from '@data/servers/servers.json';

import { COOKIE_EXPIRES_DAYS } from './constants';
import { createCookieManager } from './CookieManager';

// Derive server names as a readonly tuple
export const SERVER_OPTIONS = servers.map((s): string => s.name) as readonly string[];

export type ServerOption = (typeof SERVER_OPTIONS)[number];

export const serverCookie = createCookieManager<ServerOption>('server', SERVER_OPTIONS, COOKIE_EXPIRES_DAYS);

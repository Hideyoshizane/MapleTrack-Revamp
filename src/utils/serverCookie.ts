import { COOKIE_EXPIRES_DAYS } from '@constants/cookiesConstants';
import { SERVER_NAMES, type ServerName } from '@data/servers/servers';

import { createCookieManager } from './cookieManager';

export type ServerOption = ServerName;

export const serverCookie = createCookieManager<ServerOption>('server', SERVER_NAMES, COOKIE_EXPIRES_DAYS);

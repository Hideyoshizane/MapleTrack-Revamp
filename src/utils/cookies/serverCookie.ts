import Cookies from 'js-cookie';

const SERVER_COOKIE_KEY = 'server';
const COOKIE_EXPIRES_DAYS = 60;

export const getServerCookie = (): string | undefined => Cookies.get(SERVER_COOKIE_KEY);

export const setServerCookie = (serverName: string) => {
	Cookies.set(SERVER_COOKIE_KEY, serverName, { expires: COOKIE_EXPIRES_DAYS });
};

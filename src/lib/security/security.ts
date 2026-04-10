import Tokens from 'csrf';

const tokens = new Tokens();

export const SENSITIVE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'] as const;
export type SensitiveMethod = (typeof SENSITIVE_METHODS)[number];

const CSRF_SECRET = process.env.CSRF_SECRET || 'fallback-secret';

export const generateCsrfToken = (): string => {
	return tokens.create(CSRF_SECRET);
};

export const verifyCsrfToken = (cookieToken: string, headerToken: string): boolean => {
	return tokens.verify(CSRF_SECRET, headerToken) && cookieToken === headerToken;
};

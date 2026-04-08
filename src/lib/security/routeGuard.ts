import { getToken } from 'next-auth/jwt';

import { createResponse } from '@utils/createResponse';

import { enforceVersion } from '../config/tokenChange';

import { verifyCsrfToken, SENSITIVE_METHODS } from './security';

import type { SensitiveMethod } from './security';
import type { ApiResponse } from '@sharedTypes/api';
import type { NextRequest, NextResponse } from 'next/server';

type ProtectedHandler = (request: NextRequest, userId: string) => Promise<NextResponse>;

export const routeGuard =
	(handler: ProtectedHandler) =>
	async (request: NextRequest): Promise<NextResponse> => {
		// CSRF validation
		if (SENSITIVE_METHODS.includes(request.method as SensitiveMethod)) {
			const cookieToken = request.cookies.get('csrf-token')?.value || '';
			const headerToken = request.headers.get('x-csrf-token') || '';

			if (!cookieToken || !headerToken || !verifyCsrfToken(cookieToken, headerToken)) {
				return createResponse<ApiResponse>({ success: false, message: 'Invalid CSRF token' }, 403);
			}
		}

		// Strict origin check
		if (process.env.NODE_ENV === 'production') {
			try {
				const origin = request.headers.get('origin');
				const host = request.headers.get('host');

				if (!origin || !host) {
					throw new Error('Missing origin/host');
				}

				const originUrl = new URL(origin);
				if (originUrl.host !== host) {
					throw new Error('Origin mismatch');
				}
			} catch {
				return createResponse<ApiResponse>({ success: false, message: 'Invalid origin' }, 403);
			}
		}

		const versionRedirect = await enforceVersion(request);
		if (versionRedirect) {
			return versionRedirect;
		}

		const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

		if (!token || typeof token.id !== 'string') {
			return createResponse<ApiResponse>({ success: false, message: 'Unauthorized' }, 401);
		}

		return handler(request, token.id);
	};

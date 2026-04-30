import { auth } from '@/auth';
import { createResponse } from '@utils/createResponse';

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

				if (origin && host) {
					const originUrl = new URL(origin);
					if (originUrl.host !== host) {
						throw new Error('Origin mismatch');
					}
				}
			} catch {
				return createResponse<ApiResponse>({ success: false, message: 'Invalid origin' }, 403);
			}
		}

		const session = await auth();
		if (!session?.user?.id) {
			return createResponse<ApiResponse>({ success: false, message: 'Unauthorized' }, 401);
		}

		return handler(request, session.user.id);
	};

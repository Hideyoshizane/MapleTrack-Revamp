import { auth } from '@/auth';
import { createResponse } from '@utils/createResponse';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextRequest, NextResponse } from 'next/server';

type ProtectedHandler = (request: NextRequest, userId: string) => Promise<NextResponse>;

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'] as const;
type MutatingMethod = (typeof MUTATING_METHODS)[number];

export const routeGuard =
	(handler: ProtectedHandler) =>
	async (request: NextRequest): Promise<NextResponse> => {
		if (process.env.NODE_ENV === 'production') {
			if (MUTATING_METHODS.includes(request.method as MutatingMethod)) {
				const origin = request.headers.get('origin');
				const host = request.headers.get('host');

				if (!origin || !host) {
					return createResponse<ApiResponse>({ success: false, message: 'Invalid origin' }, 403);
				}

				try {
					const originUrl = new URL(origin);
					if (originUrl.host !== host) {
						throw new Error('Origin mismatch');
					}
				} catch {
					return createResponse<ApiResponse>({ success: false, message: 'Invalid origin' }, 403);
				}
			}
		}

		const session = await auth();

		if (!session?.user?.id) {
			return createResponse<ApiResponse>({ success: false, message: 'Unauthorized' }, 401);
		}

		return handler(request, session.user.id);
	};

import { auth } from '@/auth';

import { LASTVERSION } from '@data/user/constants';
import { credentialsSchema } from '@features/user/schemas/user.schema';
import { prisma } from '@lib/prisma';
import { createResponse } from '@utils/createResponse';
import { logError, logZodError } from '@utils/logger';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextRequest, NextResponse } from 'next/server';

const route = '/api/account/signin';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		const parseResult = credentialsSchema.safeParse(await request.json());
		if (!parseResult.success) {
			logZodError(parseResult.error, { route });

			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const { username: name, password } = parseResult.data;

		const user = await prisma.user.findUnique({
			where: { name },
			select: { id: true, email: true, version: true },
		});
		if (!user) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid username or password' }, 401);
		}

		const response = await auth.api.signInEmail({ body: { email: user.email, password }, asResponse: true });
		if (!response.ok) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid username or password' }, 401);
		}

		await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

		return new Response(
			JSON.stringify({
				success: true,
				message: 'Login successful',
				data: { name, version: user.version, lastVersion: LASTVERSION },
			}),
			{ status: response.status, headers: new Headers(response.headers) },
		) as NextResponse;
	} catch (error) {
		logError(error, { route });

		return createResponse<ApiResponse>({ success: false, message: 'An error occurred during login' }, 500);
	}
};

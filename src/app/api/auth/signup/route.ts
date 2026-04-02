import argon2 from 'argon2';

import { LASTVERSION } from '@data/user/constants';
import { createBossList } from '@features/Boss/bossListService';
import { signupRequestSchema } from '@features/user/schemas/user.schema';
import { prisma } from '@lib/prisma';
import { createResponse } from '@utils/createResponse';
import { logError, logZodError } from '@utils/logger';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextRequest, NextResponse } from 'next/server';

const route = '/api/account/signup';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		const parseResult = signupRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			logZodError(parseResult.error, { route: route });
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}
		const { username, email, password } = parseResult.data;

		const hashedPassword = await argon2.hash(password, {
			type: argon2.argon2id,
			memoryCost: 2 ** 16,
			timeCost: 3,
			parallelism: 1,
		});

		await prisma.$transaction(async (tx) => {
			const newUser = await tx.user.create({
				data: {
					username,
					email,
					password: hashedPassword,
					version: LASTVERSION,
				},
				select: { id: true },
			});

			await createBossList(tx, newUser.id);
		});

		return createResponse<ApiResponse>({ success: true, message: 'User created successfully' }, 201);
	} catch (error) {
		logError(error, { route: route });
		return createResponse<ApiResponse>({ success: false, message: 'An error occurred during signup' }, 500);
	}
};

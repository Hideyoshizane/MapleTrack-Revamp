import { LASTVERSION } from '@data/user/constants';
import { createBossList } from '@features/boss/bossListService';
import { signupRequestSchema } from '@features/user/schemas/user.schema';
import { prisma } from '@lib/prisma';
import { hashPassword } from '@lib/security/password';
import { createResponse } from '@utils/createResponse';
import { logError, logZodError } from '@utils/logger';
import { nowInUtc } from '@utils/time';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextRequest, NextResponse } from 'next/server';

const route = '/api/account/signup';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		const parseResult = signupRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			logZodError(parseResult.error, { route });

			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const { username: name, password } = parseResult.data;
		const email = parseResult.data.email.trim().toLowerCase();

		const existingUser = await prisma.user.findFirst({
			where: { OR: [{ name }, { email }] },
			select: { name: true, email: true },
		});

		if (existingUser) {
			const isNameTaken = existingUser.name === name;

			return createResponse<ApiResponse>(
				{
					success: false,
					message: isNameTaken ? 'This name is already taken.' : 'This e-mail is already in use.',
				},
				409,
			);
		}

		const hashedPassword = await hashPassword(password);

		await prisma.$transaction(async (tx) => {
			const newUser = await tx.user.create({
				data: { name, email, version: LASTVERSION, liberationLastUpdate: nowInUtc() },
				select: { id: true },
			});

			await tx.account.create({
				data: { accountId: newUser.id, providerId: 'credential', userId: newUser.id, password: hashedPassword },
			});

			await createBossList(tx, newUser.id);
		});

		return createResponse<ApiResponse>({ success: true, message: 'User created successfully' }, 201);
	} catch (error) {
		logError(error, { route });

		return createResponse<ApiResponse>({ success: false, message: 'An error occurred during signup' }, 500);
	}
};

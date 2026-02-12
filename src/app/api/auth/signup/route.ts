import { Prisma } from '@prisma/client';
import argon2 from 'argon2';

import { signupRequestSchema } from '@/schemas/auth.schemas';
import { LASTVERSION } from '@data/user/constants';
import { createBossList } from '@features/Boss/bossListService';
import { prisma } from '@lib/prisma';
import { createResponse } from '@utils/createResponse';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		let body: unknown;

		try {
			body = await request.json();
		} catch {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		// Validate request body using Zod
		const parseResult = signupRequestSchema.safeParse(body);
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const { username, email, password } = parseResult.data;

		const hashedPassword = await argon2.hash(password, {
			type: argon2.argon2id,
			memoryCost: 2 ** 16,
			timeCost: 3,
			parallelism: 1,
		});

		// Save user
		await prisma.$transaction(async (tx) => {
			const newUser = await tx.user.create({
				data: {
					username,
					email,
					password: hashedPassword,
					version: LASTVERSION,
					resetPasswordToken: null,
					resetPasswordExpires: null,
				},
				select: {
					id: true,
				},
			});

			await createBossList(tx, newUser.id);
		});

		return createResponse<ApiResponse>({ success: true, message: 'User created successfully' }, 201);
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
			return createResponse<ApiResponse>({ success: false, message: 'This username or email is not available.' }, 400);
		}

		console.error('signup_failed', { error: error instanceof Error ? error.message : 'unknown' });
		return createResponse<ApiResponse>({ success: false, message: 'An error occurred during signup' }, 500);
	}
};

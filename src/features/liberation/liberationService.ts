'use server';
import { prisma } from '@lib/prisma';

import type { LiberationType, Prisma } from '@prisma/client';

type CreateLiberationInput = {
	userId: string;
	characterId: string;
	type: LiberationType;
	currentQuest: string;
};

type CreateLiberationResult = { success: true } | { success: false; reason: 'ALREADY_EXISTS' | 'UNKNOWN_ERROR' };

export const createLiberation = async (input: CreateLiberationInput): Promise<CreateLiberationResult> => {
	try {
		await prisma.liberation.create({
			data: {
				userId: input.userId,
				characterId: input.characterId,
				type: input.type,
				currentQuest: input.currentQuest,
				currentPoints: 0,
				genesisPass: false,
				liberated: false,
				lastUpdate: new Date(),
			},
		});

		return { success: true };
	} catch (error: unknown) {
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
			return { success: false, reason: 'ALREADY_EXISTS' };
		}

		return { success: false, reason: 'UNKNOWN_ERROR' };
	}
};

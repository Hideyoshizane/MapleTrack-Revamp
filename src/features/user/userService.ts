import { LASTVERSION } from '@data/user/constants';
import { prisma } from '@lib/prisma';
import { nowInUtc } from '@utils/time';

// Update the lastLogin timestamp to current UTC time
export const updateLastLogin = async (userId: string): Promise<void> => {
	if (!prisma) {
		throw new Error('Prisma is not available on the client');
	}

	await prisma.user.update({ where: { id: userId }, data: { lastLogin: nowInUtc() } });
};

// Set the version to the latest defined constant
export const updateUserVersion = async (userId: string): Promise<void> => {
	if (!prisma) {
		throw new Error('Prisma is not available on the client');
	}

	await prisma.user.update({ where: { id: userId }, data: { version: LASTVERSION } });
};

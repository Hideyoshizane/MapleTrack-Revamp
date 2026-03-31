import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { LASTVERSION } from '@data/user/constants';
import { prisma } from '@lib/prisma';

dayjs.extend(utc);

// Update the lastLogin timestamp to current UTC time
export const updateLastLogin = async (userId: string): Promise<void> => {
	if (!prisma) {
		throw new Error('Prisma is not available on the client');
	}
	await prisma.user.update({
		where: { id: userId },
		data: { lastLogin: dayjs().utc().toDate() },
	});
};

// Set the version to the latest defined constant
export const updateUserVersion = async (userId: string): Promise<void> => {
	if (!prisma) {
		throw new Error('Prisma is not available on the client');
	}
	await prisma.user.update({
		where: { id: userId },
		data: { version: LASTVERSION },
	});
};

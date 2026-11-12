import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@/generated/prisma/client';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	throw new Error('Database connection string is missing. Set DATABASE_URL in your environment variables.');
}

declare global {
	var prisma: PrismaClient | undefined;
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL });

export const prisma: PrismaClient =
	global.prisma ??
	new PrismaClient({
		adapter,
		log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
		transactionOptions: { timeout: 15_000, maxWait: 10_000 },
	});

if (process.env.NODE_ENV !== 'production') {
	global.prisma = prisma;
}

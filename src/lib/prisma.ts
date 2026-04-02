import { PrismaClient } from '@prisma/client';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	throw new Error('Database connection string is missing. Set DATABASE_URL in your environment variables.');
}

declare global {
	var prisma: PrismaClient | undefined;
}

// Create Prisma client with logging configuration
export const prisma: PrismaClient =
	global.prisma ??
	new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'] });

// In development, use global instance to prevent multiple instances during hot-reload
if (process.env.NODE_ENV !== 'production') {
	global.prisma = prisma;
}

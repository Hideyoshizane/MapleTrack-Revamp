import NextAuth from 'next-auth';

import { authOptions } from '@/lib/authOptions';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const GET = NextAuth(authOptions);

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const POST = NextAuth(authOptions);

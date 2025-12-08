import { Auth } from '@auth/core';
import { type NextRequest } from 'next/server';

import { authOptions } from '@/authOptions';

// App Router route handler for NextAuth
export const POST = async (req: NextRequest) => Auth(req, authOptions);
export const GET = async (req: NextRequest) => Auth(req, authOptions);

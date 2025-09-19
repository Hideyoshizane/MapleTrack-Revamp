import { NextResponse } from 'next/server';

export const createResponse = <T>(body: T, status = 200): NextResponse => NextResponse.json(body, { status });

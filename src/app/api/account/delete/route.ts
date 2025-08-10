import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { DeleteAccountRequestBody } from '@/shared/types/api/auth';
import connectToDatabase from '@lib/mongooseConect';
import User from '@models/user';
import { createResponse } from '@utils/api/createResponse';
import { isString } from '@utils/guards/isString';
import { sanitizeInputBackEnd } from '@utils/sanitize/sanitizeInputBackEnd';

export async function DELETE(req: NextRequest) {
	try {
		await connectToDatabase();

		// Extract token from the request cookies
		const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

		if (!token) {
			return createResponse({ success: false, error: 'Unauthorized' }, 401);
		}

		let rawBody: unknown;

		// Parse JSON body and fail early if malformed
		try {
			rawBody = await req.json();
		} catch {
			return createResponse({ success: false, error: 'Invalid JSON payload' }, 400);
		}

		// Assert rawBody shape as DeleteAccountRequestBody
		const body = rawBody as DeleteAccountRequestBody;

		// Validate that the properties are strings
		if (!isString(body.username)) {
			return createResponse({ success: false, error: 'Invalid request body' }, 400);
		}

		// Sanitize input
		const username = sanitizeInputBackEnd(body.username);

		if (!username) {
			return createResponse({ success: false, error: 'Missing required fields' }, 400);
		}

		// Ensure the authenticated user matches the username being deleted
		if (token.username !== username) {
			return createResponse({ success: false, error: 'Forbidden' }, 403);
		}

		// Find user by username
		const user = await User.findOne({ username });
		if (!user) {
			return createResponse({ success: false, error: 'Invalid username' }, 404);
		}

		// Delete the user
		await User.deleteOne({ _id: user._id });

		return createResponse({ success: true, message: 'Account deleted successfully.' }, 200);
	} catch (error) {
		console.error('Delete account error:', error);
		return createResponse({ success: false, error: 'Internal Server Error' }, 500);
	}
}

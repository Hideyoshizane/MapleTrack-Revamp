import bcrypt from 'bcrypt';
import { NextRequest } from 'next/server';

import { ChangePasswordRequestBody } from '@/shared/types/api/auth';
import connectToDatabase from '@lib/mongooseConect';
import User from '@models/user';
import { createResponse } from '@utils/api/createResponse';
import { isString } from '@utils/guards/isString';
import { sanitizeInputBackEnd } from '@utils/sanitize/sanitizeInputBackEnd';
import { validatePassword } from '@utils/validation/';

export async function POST(req: NextRequest) {
	try {
		await connectToDatabase();

		let rawBody: unknown;

		// Parse JSON body and fail early if malformed
		try {
			rawBody = await req.json();
		} catch {
			return createResponse({ success: false, error: 'Invalid JSON payload' }, 400);
		}

		// Assert rawBody shape as ChangePasswordRequestBody
		const body = rawBody as ChangePasswordRequestBody;

		// Validate that the properties are strings
		if (!isString(body.username) || !isString(body.currentPassword) || !isString(body.newPassword)) {
			return createResponse({ success: false, error: 'Invalid request body' }, 400);
		}
		// Sanitize input
		const username = sanitizeInputBackEnd(body.username);
		const currentPassword = sanitizeInputBackEnd(body.currentPassword);
		const newPassword = sanitizeInputBackEnd(body.newPassword);

		if (!username || !currentPassword || !newPassword) {
			return createResponse({ success: false, error: 'Missing required fields' }, 400);
		}

		// Validate sanitized inputs
		const passwordValidation = validatePassword(newPassword);

		// If any validation fails, return early
		if (!passwordValidation.isValid) {
			return createResponse(
				{
					success: false,
					error: 'Validation failed',
					details: {
						password: passwordValidation.error,
					},
				},
				400
			);
		}

		// Find user by username
		const user = await User.findOne({ username });

		if (!user) {
			return createResponse({ success: false, error: 'Invalid username' }, 404);
		}

		// Verify currentPassword matches stored password
		const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
		if (!isCurrentPasswordCorrect) {
			return createResponse({ success: false, error: 'Current password is incorrect' }, 401);
		}

		// Check if newPassword is same as current password
		const isNewPasswordSameAsOld = await bcrypt.compare(newPassword, user.password);
		if (isNewPasswordSameAsOld) {
			return createResponse({ success: false, error: 'New password must be different from the current password' }, 400);
		}

		// Hash new password
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Update user password and remove reset token
		user.password = hashedPassword;
		await user.save();

		return createResponse({ success: true, message: 'Password changed.' }, 200);
	} catch (error) {
		console.error('Signup error:', error);
		return createResponse({ success: false, error: 'Internal Server Error' }, 500);
	}
}

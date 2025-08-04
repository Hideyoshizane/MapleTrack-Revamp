import crypto from 'crypto';

import bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { NextRequest } from 'next/server';

import { ResetPasswordRequestBody } from '@/shared/types/api/auth';
import connectToDatabase from '@lib/mongooseConect';
import User from '@models/user';
import { createResponse } from '@utils/api/createResponse';
import { isString } from '@utils/guards/isString';
import { sanitizeInputBackEnd } from '@utils/sanitize/sanitizeInputBackEnd';
import { validatePassword } from '@utils/validation/';

dayjs.extend(utc);

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

		// Assert rawBody shape as SignupRequestBody
		const body = rawBody as ResetPasswordRequestBody;

		// Validate that the properties are strings
		if (!isString(body.token) || !isString(body.password)) {
			return createResponse({ success: false, error: 'Invalid request body' }, 400);
		}

		// Sanitize input
		const rawToken = sanitizeInputBackEnd(body.token);
		const password = sanitizeInputBackEnd(body.password);

		if (!rawToken || !password) {
			return createResponse({ success: false, error: 'Missing required fields' }, 400);
		}

		// Validate sanitized inputs
		const passwordValidation = validatePassword(password);

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

		// Hash the token to compare against the hashed one stored in the DB
		const token = crypto.createHash('sha256').update(rawToken).digest('hex');

		// Find user with matching reset token
		const user = await User.findOne({ resetPasswordToken: token });

		if (!user || !user.resetPasswordExpires || dayjs.utc(user.resetPasswordExpires).isBefore(dayjs.utc())) {
			return createResponse({ success: false, error: 'Invalid or expired token' }, 404);
		}

		// Compare new password with current one
		const isSamePassword = await bcrypt.compare(password, user.password);
		if (isSamePassword) {
			return createResponse({ success: false, error: 'New password must be different from the current password' }, 400);
		}

		// Generate the Token to be send and stored
		const hashedPassword = await bcrypt.hash(password, 10);

		// Update user password and remove reset token
		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;
		await user.save();

		return createResponse(
			{
				success: true,
				message: 'Password reseted.',
			},
			200
		);
	} catch (error) {
		console.error('Signup error:', error);
		return createResponse({ success: false, error: 'Internal Server Error' }, 500);
	}
}

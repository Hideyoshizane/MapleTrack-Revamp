import argon2 from 'argon2';

import { LASTVERSION } from '@data/user/constants';
import { createBossList } from '@features/Boss/bossListService';
import User from '@features/user/userModel';
import connectToDatabase from '@lib/mongooseConect';
import { signupRequestSchema } from '@schemas/authSchemas';
import { createResponse } from '@utils/createResponse';
import { sanitizeInputBackEnd } from '@utils/sanitizeInputBackEnd';
import { validateUsername, validateEmail, validatePassword } from '@utils/validators';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextRequest, NextResponse } from 'next/server';

//import { createBossList } from '@/services/bossList';
//import { createMissingCharacters } from '@/services/character';
//import { searchServersAndCreateMissing } from '@/services/server';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		await connectToDatabase();

		// Validate request body using Zod
		const parseResult = signupRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		const { username: rawUsername, email: rawEmail, password: rawPassword } = parseResult.data;

		// Sanitize inputs
		const [username, email, password] = [rawUsername, rawEmail, rawPassword].map(sanitizeInputBackEnd);
		if (!username || !email || !password) {
			return createResponse<ApiResponse>({ success: false, message: 'Missing required fields' }, 400);
		}

		// Validate sanitized inputs
		const usernameValidation = validateUsername(username);
		const emailValidation = validateEmail(email);
		const passwordValidation = validatePassword(password);
		if (!usernameValidation.isValid || !emailValidation.isValid || !passwordValidation.isValid) {
			const message = [usernameValidation.error, emailValidation.error, passwordValidation.error]
				.filter(Boolean)
				.join('\n');

			return createResponse<ApiResponse>(
				{
					success: false,
					message: message,
				},
				400
			);
		}

		// Check if username or email already exists after validation
		const existingUser = await User.findOne({ $or: [{ username }, { email }] });
		if (existingUser)
			return createResponse<ApiResponse>({ success: false, message: 'This username or email is not available.' }, 400);

		// Hash password
		const hashedPassword = await argon2.hash(password, {
			type: argon2.argon2id,
		});
		const newUser = new User({
			username,
			email,
			password: hashedPassword,
			version: LASTVERSION,
			resetPasswordToken: null,
			resetPasswordExpires: null,
		});

		// Save user
		await newUser.save();
		await createBossList(username);

		return createResponse<ApiResponse<{ id: string; username: string; email: string }>>(
			{
				success: true,
				message: 'User created successfully',
				data: { id: newUser._id.toString(), username: newUser.username, email: newUser.email },
			},
			201
		);
	} catch (error) {
		console.error('Signup error:', error);
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};
